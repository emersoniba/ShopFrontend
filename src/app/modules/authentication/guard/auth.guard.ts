import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        // Verificar si el usuario está autenticado
        if (!this.authService.verificarToken()) {
            this.toastr.warning(
                'Debe iniciar sesión para acceder a esta página',
                'Acceso denegado'
            );
            this.router.navigate(['/login']);
            return false;
        }

        // Si no hay roles requeridos, permitir acceso
        const requiredRoles = route.data['roles'] as string[];
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Verificar roles
        const hasRole = this.authService.hasAnyRole(requiredRoles);
        
        if (!hasRole) {
            this.toastr.error('No tiene permisos para acceder a esta sección', 'Acceso denegado');
            // Redirigir al dashboard del admin (no a tienda)
            this.router.navigate(['/admin/dashboard/default']);
            return false;
        }

        return true;
    }
}