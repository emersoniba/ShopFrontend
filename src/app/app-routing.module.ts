import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import LoginComponent from './modules/authentication/login/login.component';
import { AdminComponent } from './theme/layouts/admin/admin.component';
import { AuthGuard } from './modules/authentication/guard/auth.guard';
import { PersonalComponent } from './modules/almacen/personal/personal.component';
import { MaterialComponent } from './modules/almacen/parametrizacion/material/material.component';
import { ProductDetailComponent } from './modules/shop/product-detail.component';
import { CartComponent } from './modules/shop/carrito/cart.component';

const routes: Routes = [
    // ============================================
    // RUTA PRINCIPAL - TIENDA (pública, sin login)
    // ============================================
    {
        path: '',
        component: ProductDetailComponent,
        pathMatch: 'full'
    },
    {
        path: 'tienda',
        component: ProductDetailComponent
    },
    {
        path: 'carrito',
        component: CartComponent
    },

    // ============================================
    // LOGIN
    // ============================================
    {
        path: 'login',
        component: LoginComponent
    },

    // ============================================
    // PANEL ADMIN (requiere autenticación)
    // IMPORTANTE: Todas las rutas administrativas deben estar DENTRO de /admin
    // ============================================
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard/default',
                pathMatch: 'full'
            },
            {
                path: 'dashboard/default',
                loadComponent: () => import('./modules/dashboard/dashboard.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'usuario',
                component: PersonalComponent,
                canActivate: [AuthGuard],
                data: { roles: ['SuperAdmin', 'AdminTienda', 'Cajero'] }
            },
            {
                path: 'material',
                component: MaterialComponent,
                canActivate: [AuthGuard],
                data: { roles: ['SuperAdmin', 'AdminTienda', 'Almacenero'] }
            }
        ]
    },

    // ============================================
    // REDIRECCIÓN POR DEFECTO - Cualquier ruta no encontrada va a tienda
    // ============================================
    {
        path: '**',
        redirectTo: '/tienda'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }