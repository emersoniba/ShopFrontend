import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import LoginComponent from './modules/authentication/login/login.component';
import { AdminComponent } from './theme/layouts/admin/admin.component';
import { AuthGuard } from './modules/authentication/guard/auth.guard';
import { PersonalComponent } from './modules/almacen/personal/personal.component';
import { MaterialComponent } from './modules/almacen/parametrizacion/material/material.component';
//import { ShopComponent } from './modules/shop/shop.component';

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
export class AppRoutingModule {}