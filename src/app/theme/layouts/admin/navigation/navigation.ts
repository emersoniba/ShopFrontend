export interface NavigationItem {
	id: string;
	title: string;
	type: 'item' | 'collapse' | 'group';
	translate?: string;
	icon?: string;
	hidden?: boolean;
	url?: string;
	classes?: string;
	groupClasses?: string;
	exactMatch?: boolean;
	external?: boolean;
	target?: boolean;
	breadcrumbs?: boolean;
	children?: NavigationItem[];
	link?: string;
	description?: string;
	roles?: string[];
}

export const NavigationItems: NavigationItem[] = [
	{
		id: 'dashboard',
		title: 'Dashboard',
		type: 'group',
		icon: 'icon-navigation',
		children: [
			{
				id: 'default',
				title: 'Default',
				type: 'item',
				classes: 'nav-item',
				url: '/dashboard/default',
				icon: 'ti ti-dashboard',
				breadcrumbs: false,
				//roles: ['SuperAdmin', 'AdminTienda']

			}
		]
	},
	{
		id: 'personal',
		title: 'Personal',
		type: 'group',
		icon: 'icon-navigation',
		children: [
			{
				id: 'usuario',
				title: 'Usuarios',
				type: 'item',
				classes: 'nav-item',
				url: '/usuario',
				icon: 'ti ti-user',
				target: false,
				breadcrumbs: true,
				roles: ['SuperAdmin']
			},
			{
				id: 'ventas',
				title: 'Ventas',
				type: 'item',
				classes: 'nav-item',
				url: '/ventas',
				icon: 'ti ti-shopping-cart',
				target: false,
				breadcrumbs: true,
				roles: ['SuperAdmin', 'AdminTienda', 'Cajero']
			}
		]
	},
	{
		id: 'parametrizacion',
		title: 'Parametrizaciones',
		type: 'group',
		icon: 'icon-navigation',
		children: [
			{
				id: 'material',
				title: 'Materiales',
				type: 'item',
				classes: 'nav-item',
				url: '/material',
				icon: 'ti ti-template',
				target: false,
				breadcrumbs: true,
				roles: ['SuperAdmin', 'Almacenero']
			},
			{
				id: 'movimientos',
				title: 'Movimientos',
				type: 'item',
				classes: 'nav-item',
				url: '/movimientos',
				icon: 'ti ti-exchange',
				target: false,
				breadcrumbs: true,
				roles: ['SuperAdmin', 'Almacenero']
			}
		]
	},
	{
		id: 'bandeja',
		title: 'Bandeja de Solicitudes',
		type: 'group',
		icon: 'icon-navigation',
		children: []
	}
];