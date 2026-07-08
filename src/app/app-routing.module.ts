import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import LoginComponent from './modules/authentication/login/login.component';
import { AdminComponent } from './theme/layouts/admin/admin.component';
import { AuthGuard } from './modules/authentication/guard/auth.guard';
import { PersonalComponent } from './modules/almacen/personal/personal.component';
import { MaterialComponent } from './modules/almacen/parametrizacion/material/material.component';
import { MovimientoComponent } from './modules/almacen/parametrizacion/movimiento/movimiento.component';
import { VentasComponent } from './modules/almacen/parametrizacion/ventas/ventas.component';

const routes: Routes = [
	{
		path: '',
		component: AdminComponent,
		children: [
			{
				path: '',
				redirectTo: '/dashboard/default',
				pathMatch: 'full'
			},
			{
				path: 'dashboard/default',
				loadComponent: () => import('./modules/dashboard/dashboard.component'),
				canActivate: [AuthGuard],
				//data: { roles: ['SuperAdmin', 'AdminTienda'] }
			},
			{
				path: 'usuario',
				component: PersonalComponent,
				canActivate: [AuthGuard],
				data: { roles: ['SuperAdmin', 'AdminTienda'] }
			},
			{
				path: 'material',
				component: MaterialComponent,
				canActivate: [AuthGuard],
				data: { roles: ['SuperAdmin', 'AdminTienda'] }
			},
			{
				path: 'movimientos',
				component: MovimientoComponent,
				canActivate: [AuthGuard],
				data: { roles: ['SuperAdmin', 'AdminTienda'] }
			},
			{
				path: 'ventas',
				component: VentasComponent,
				canActivate: [AuthGuard],
				data: { roles: ['SuperAdmin', 'AdminTienda', 'Cajero'] }
			}
		]
	},
	{
		path: 'login',
		component: LoginComponent
		//  loadComponent: () => import('./modules/dashboard/dashboard.component'),
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }