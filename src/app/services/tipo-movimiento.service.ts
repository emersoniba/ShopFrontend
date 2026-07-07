// src/app/services/tipo-movimiento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TipoMovimiento } from '../models/tipo-movimiento.model';

@Injectable({
    providedIn: 'root'
})
export class TipoMovimientoService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getTiposMovimiento(activo?: boolean): Observable<TipoMovimiento[]> {
        let params = new HttpParams();
        if (activo !== undefined) {
            params = params.set('activo', String(activo));
        }
        return this.http.get<any>(`${this.apiUrl}/tipos-movimiento/`, { params }).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getTipoMovimiento(id: number): Observable<TipoMovimiento> {
        return this.http.get<TipoMovimiento>(`${this.apiUrl}/tipos-movimiento/${id}/`);
    }

    createTipoMovimiento(data: Partial<TipoMovimiento>): Observable<TipoMovimiento> {
        return this.http.post<TipoMovimiento>(`${this.apiUrl}/tipos-movimiento/`, data);
    }

    updateTipoMovimiento(id: number, data: Partial<TipoMovimiento>): Observable<TipoMovimiento> {
        return this.http.put<TipoMovimiento>(`${this.apiUrl}/tipos-movimiento/${id}/`, data);
    }

    deleteTipoMovimiento(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tipos-movimiento/${id}/`);
    }

    toggleActivo(id: number, activo: boolean): Observable<TipoMovimiento> {
        return this.http.patch<TipoMovimiento>(`${this.apiUrl}/tipos-movimiento/${id}/`, { activo });
    }
}