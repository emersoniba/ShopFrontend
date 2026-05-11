// auth.service.ts - Versión actualizada con encriptación
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, throwError, tap, map } from 'rxjs';
import { AuthUser, LoginResponse, Usuario } from 'src/app/models/usuario.models';
import { environment } from 'src/environments/environment';
import { jwtDecode } from "jwt-decode";
import { EncryptionService } from './encryption.service';

export interface AuthError {
    message: string;
    code?: string;
    status?: number;
    remaining_attempts?: number | null;
    wait_minutes?: number | null;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'tkn-almacen';
    private readonly REFRESH_KEY = 'refresh-tkn-almacen';
    private readonly USER_KEY = 'user-almacen';

    private apiUrl = environment.apiUrl;
    private _authenticatedSubject = new BehaviorSubject<boolean>(this.verificarToken());
    authenticated$ = this._authenticatedSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router,
        private encryptionService: EncryptionService
    ) { }

    private getUserFromStorage(): Usuario | null {
        const encryptedUserData = localStorage.getItem(this.USER_KEY);
        if (encryptedUserData) {
            try {
                // Desencriptar datos del usuario
                const userData = this.encryptionService.decrypt(encryptedUserData);
                return userData as Usuario;
            } catch {
                return null;
            }
        }
        return null;
    }

    private saveUserToStorage(user: Usuario): void {
        // Encriptar datos del usuario antes de guardar
        const encryptedUser = this.encryptionService.encrypt(user);
        localStorage.setItem(this.USER_KEY, encryptedUser);
    }

    private saveTokens(access: string, refresh: string): void {
        // Opcional: también encriptar tokens
        if (environment.security?.encryptTokens) {
            localStorage.setItem(this.TOKEN_KEY, this.encryptionService.encrypt(access));
            localStorage.setItem(this.REFRESH_KEY, this.encryptionService.encrypt(refresh));
        } else {
            localStorage.setItem(this.TOKEN_KEY, access);
            localStorage.setItem(this.REFRESH_KEY, refresh);
        }
    }

    private getToken(): string | null {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (token && environment.security?.encryptTokens) {
            return this.encryptionService.decrypt(token);
        }
        return token;
    }

    private getRefreshToken(): string | null {
        const token = localStorage.getItem(this.REFRESH_KEY);
        if (token && environment.security?.encryptTokens) {
            return this.encryptionService.decrypt(token);
        }
        return token;
    }

    loginUser(data: AuthUser): Observable<LoginResponse> {
        if (this.verificarToken()) {
            return throwError(() => new Error('Usuario ya se encuentra autenticado'));
        }

        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, data).pipe(
            tap((response: LoginResponse) => {
                // Guardar tokens (opcionalmente encriptados)
                this.saveTokens(response.data.access, response.data.refresh);

                // Guardar datos del usuario encriptados
                this.saveUserToStorage(response.data.user);
                
                this.currentUserSubject.next(response.data.user);
                this._authenticatedSubject.next(true);
            }),
            map((response: LoginResponse) => response),
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Error de autenticación';
                let errorCode: string | undefined;
                let remainingAttempts: number | null = null;
                let waitMinutes: number | null = null;

                console.log('=== ERROR COMPLETO ===');
                console.log('Status:', error.status);
                console.log('error.error:', error.error);
                
                if (error.status === 401 || error.status === 400) {
                    if (error.error) {
                        if (error.error.message) {
                            errorMessage = error.error.message;
                        }
                        
                        if (error.error.errors && error.error.errors.errors) {
                            const nestedErrors = error.error.errors.errors;
                            
                            if (nestedErrors.wait_minutes && nestedErrors.wait_minutes[0]) {
                                waitMinutes = parseInt(nestedErrors.wait_minutes[0]);
                            }
                            
                            if (nestedErrors.remaining_attempts && nestedErrors.remaining_attempts[0]) {
                                remainingAttempts = parseInt(nestedErrors.remaining_attempts[0]);
                            }
                            
                            if (nestedErrors.message && nestedErrors.message[0]) {
                                errorMessage = nestedErrors.message[0];
                            }
                        }
                        
                        if (error.error.errors) {
                            if (error.error.errors.wait_minutes !== undefined) {
                                waitMinutes = error.error.errors.wait_minutes;
                            }
                            if (error.error.errors.remaining_attempts !== undefined) {
                                remainingAttempts = error.error.errors.remaining_attempts;
                            }
                        }
                        
                        if (error.error.wait_minutes !== undefined) {
                            waitMinutes = error.error.wait_minutes;
                        }
                        if (error.error.remaining_attempts !== undefined) {
                            remainingAttempts = error.error.remaining_attempts;
                        }
                    }
                } else if (error.status === 0) {
                    errorMessage = 'Error de conexión con el servidor';
                } else if (error.status === 500) {
                    errorMessage = 'Error interno del servidor. Intente más tarde';
                }

                console.log('Datos extraídos:', { errorMessage, remainingAttempts, waitMinutes });

                return throwError(() => ({
                    message: errorMessage,
                    code: errorCode,
                    status: error.status,
                    remaining_attempts: remainingAttempts,
                    wait_minutes: waitMinutes
                }));
            })
        );
    }

    logout() {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            this.http.post(`${this.apiUrl}/auth/logout/`, { refresh: refreshToken }).subscribe({
                error: (err) => console.error('Error en logout:', err)
            });
        }

        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.USER_KEY);
        this._authenticatedSubject.next(false);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    public accessToken(): string | null {
        return this.getToken();
    }

    public refreshToken(): string | null {
        return this.getRefreshToken();
    }

    public verificarToken(): boolean {
        const token = this.getToken();

        if (!token) return false;

        try {
            const decoded: any = jwtDecode(token);
            const exp = decoded.exp * 1000;
            return Date.now() < exp;
        } catch {
            return false;
        }
    }

    public getCurrentUser(): Usuario | null {
        return this.currentUserSubject.value;
    }

    public getUserFullName(): string {
        const user = this.getCurrentUser();
        return user?.persona?.nombre_completo || user?.username || 'Usuario';
    }

    public getUserCargo(): string {
        const user = this.getCurrentUser();
        return user?.persona?.cargo || 'Sin cargo';
    }

    public getUserUnidad(): string {
        const user = this.getCurrentUser();
        return user?.persona?.unidad || 'Sin unidad';
    }

    public getUserEmail(): string {
        const user = this.getCurrentUser();
        return user?.persona?.correo || '';
    }

    public getUserTelefono(): string {
        const user = this.getCurrentUser();
        return user?.persona?.telefono || '';
    }

    public getUserRoles(): string[] {
        const user = this.getCurrentUser();
        return user?.roles?.map(r => r.nombre) || [];
    }

    public hasRole(roleName: string): boolean {
        const roles = this.getUserRoles();
        return roles.includes(roleName);
    }

    public hasAnyRole(roleNames: string[]): boolean {
        const roles = this.getUserRoles();
        return roleNames.some(role => roles.includes(role));
    }

    refreshTokenRequest(refreshToken: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/refresh/`, { refresh: refreshToken });
    }
}