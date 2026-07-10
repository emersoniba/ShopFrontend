import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { localeEs } from 'src/app/app.locale.es.grid';
import { RendererComponent } from '../bandejas/abrenderer/renderer.component';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Usuario } from 'src/app/models/usuario.models';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { PersonalFormComponent } from './personal-form/personal-form.component';

@Component({
	selector: 'app-personal',
	templateUrl: './personal.component.html',
	styleUrl: './personal.component.scss'
})
export class PersonalComponent implements OnInit, OnDestroy {
	public rowData: Usuario[] = []; // Cambiar de dataUsuario a rowData para AG Grid
	private gridApi!: GridApi<Usuario>;
	private gridColumnApi: any;
	public loading = false; // Agregar estado de carga

	public gridOptions: GridOptions = <GridOptions>{
		reactiveCustomComponents: true,
		components: {
			actionCellRenderer: RendererComponent
		},
		context: { componentParent: this },
		suppressScrollOnNewData: true,
		alwaysShowHorizontalScroll: true,
		alwaysShowVerticalScroll: true,
		enableCellTextSelection: true,
		ensureDomOrder: true
	};

	private formSubscription: Subscription | undefined;
	public rowSelection: 'single' = 'single';
	public localEs = localeEs;
	public paginationPageSize = 10;
	public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
	public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
		return params.value.toLocaleString();
	};

	columnDefs: ColDef[] = [
		{
			field: 'id',
			headerName: 'Opciones',
			filter: false,
			minWidth: 115,
			maxWidth: 115,
			cellRenderer: RendererComponent,
			pinned: 'left'
		},
		{ field: 'username', headerName: 'Usuario', filter: true, minWidth: 150, floatingFilter: true },
		{
			field: 'ci',
			headerName: 'CI',
			filter: true,
			minWidth: 120,
			floatingFilter: true,
			valueGetter: (params) => params.data?.persona?.ci || 'N/A'
		},
		{
			headerName: 'Nombre Completo',
			minWidth: 250,
			floatingFilter: true,
			valueGetter: (params) => {
				const persona = params.data?.persona;
				if (persona?.nombre_completo) return persona.nombre_completo;
				if (persona?.nombres) {
					return `${persona.nombres} ${persona.apellido_paterno || ''} ${persona.apellido_materno || ''}`.trim();
				}
				return params.data?.username || 'Sin nombre';
			}
		},
		{
			field: 'telefono',
			headerName: 'Teléfono',
			filter: true,
			minWidth: 130,
			floatingFilter: true,
			valueGetter: (params) => params.data?.persona?.telefono || 'N/A'
		},
		{
			headerName: 'Roles',
			filter: true,
			minWidth: 200,
			floatingFilter: true,
			valueGetter: (params) => params.data?.roles?.map((r) => r.nombre).join(', ') || 'Sin roles',
			cellRenderer: (params: any) => {
				if (!params.value) return '';
				const roles = params.value.split(', ');
				return roles
					.map((rol: string) => {
						// Mapeo de roles a clases de Bootstrap
						const roleClassMap: { [key: string]: string } = {
							SuperAdmin: 'bg-danger',
							AdminTienda: 'bg-purple',
							Vendedor: 'bg-success',
							Cajero: 'bg-warning text-dark',
							PersonalAlmacen: 'bg-info',
							Repartidor: 'bg-secondary',
							Cliente: 'bg-light text-dark'
						};

						const className = roleClassMap[rol] || 'bg-primary';
						return `<span class="badge ${className} me-1" style="font-size: 11px; padding: 5px 10px; border-radius: 20px;">${rol}</span>`;
					})
					.join('');
			}
		},
		{
			headerName: 'Estado',
			field: 'is_active',
			filter: true,
			minWidth: 100,
			floatingFilter: true,
			valueGetter: (params) => (params.data?.is_active ? 'Activo' : 'Inactivo'),
			cellRenderer: (params: any) => {
				const isActive = params.data?.is_active;
				return isActive ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>';
			}
		}
	];

	constructor(
		private toastr: ToastrService,
		private dialog: MatDialog,
		private alertService: SwalAlertService,
		private usuariosService: UsuariosService
	) {}

	ngOnInit(): void {
		this.getAllUsuarios();
	}

	// En getAllUsuarios(), actualizar la extracción de datos:
	public getAllUsuarios() {
		this.loading = true;
		this.formSubscription = this.usuariosService.getUsuarios().subscribe({
			next: (response: any) => {
				console.log('Respuesta del servidor:', response);

				let usuarios: any[] = [];

				// Adaptar a diferentes formatos de respuesta
				if (response?.data) {
					if (Array.isArray(response.data)) {
						usuarios = response.data;
					} else if (response.data.results) {
						// Formato paginado: { data: { count, next, previous, results: [] } }
						usuarios = response.data.results;
					}
				} else if (response?.results) {
					usuarios = response.results;
				} else if (Array.isArray(response)) {
					usuarios = response;
				}

				this.rowData = usuarios;
				this.loading = false;

				if (this.gridApi) {
					this.gridApi.setGridOption('rowData', this.rowData);
				}
			},
			error: (err) => {
				this.rowData = [];
				this.loading = false;
				console.error('Error al cargar usuarios:', err);
				this.toastr.error(HandleErrorMessage(err), 'Error');
			}
		});
	}
	public accionNuevo() {
		const dialogRef = this.dialog.open(PersonalFormComponent, {
			width: '770px',
			height: '430px',
			minWidth: '770px',
			minHeight: '450px',
			disableClose: true,
			hasBackdrop: false,
			data: {}
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result !== null) {
				this.getAllUsuarios();
			}
		});
	}

	public OnActionClick(event: any) {
		const { action, rowId, data } = event;
		if (action?.toLowerCase() === 'edit') {
			this.onActionEditar(rowId, data);
		}
		if (action?.toLowerCase() === 'delete') {
			this.onActionEliminar(rowId, data);
		}
	}

	public onActionEditar(pk: string, data: Usuario) {
		const dialogRef = this.dialog.open(PersonalFormComponent, {
			width: '770px',
			height: '430px',
			minWidth: '770px',
			minHeight: '450px',
			disableClose: true,
			hasBackdrop: false,
			data: data
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result !== null) {
				this.getAllUsuarios();
			}
		});
	}

	public onActionEliminar(pk: string, data: Usuario) {
		const tieneRoles = data.roles && data.roles.length > 0;
		let mensajeAdvertencia = '¿Está seguro de eliminar este usuario?';

		if (tieneRoles) {
			mensajeAdvertencia =
				'Este usuario tiene roles asignados. Al eliminarlo, también se eliminarán sus asignaciones de roles. ¿Desea continuar?';
		}

		this.alertService.showConfirmationDialog('Eliminar Usuario', mensajeAdvertencia).then((result) => {
			if (result.isConfirmed) {
				Swal.fire({
					title: 'Eliminando usuario...',
					html: 'Por favor espere',
					didOpen: () => {
						Swal.showLoading();
					},
					allowOutsideClick: false,
					allowEscapeKey: false
				});

				const usuarioId = parseInt(pk, 10);

				if (isNaN(usuarioId)) {
					Swal.close();
					this.toastr.error('ID de usuario inválido', 'Error');
					return;
				}

				this.usuariosService.deleteUsuario(usuarioId).subscribe({
					next: () => {
						Swal.close();
						this.toastr.success('Usuario eliminado correctamente', 'Éxito');
						this.getAllUsuarios();
					},
					error: (err) => {
						Swal.close();
						console.error('Error al eliminar:', err);

						let errorMsg = HandleErrorMessage(err);
						if (err.status === 404) {
							errorMsg = 'El usuario no existe o ya fue eliminado';
						} else if (err.status === 403) {
							errorMsg = 'No tiene permisos para eliminar este usuario';
						} else if (err.status === 400) {
							errorMsg = err.error?.message || 'No se puede eliminar el usuario';
						}

						this.toastr.error(errorMsg, 'Error al eliminar');
					}
				});
			}
		});
	}

	onGridReady(params: GridReadyEvent<Usuario>) {
		this.gridApi = params.api;
		this.gridColumnApi = params.columnApi;

		// Establecer los datos una vez que el grid está listo
		if (this.rowData.length > 0) {
			this.gridApi.setRowData(this.rowData);
		}
	}

	ngOnDestroy(): void {
		this.formSubscription?.unsubscribe();
		this.dialog.closeAll();
	}
}
