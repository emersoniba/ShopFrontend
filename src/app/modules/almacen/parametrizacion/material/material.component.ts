import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { localeEs } from 'src/app/app.locale.es.grid';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { MaterialFormComponent } from './material-form/material-form.component';
import { Producto } from 'src/app/models/producto.models';
import { ProductoService } from 'src/app/services/producto.services';
import { VerMasRendererComponent } from '../../bandejas/text_expand-render/text-expand-renderer.component';
import { ImageRendererComponent } from '../../bandejas/imagen-render/image-renderer.component';

@Component({
	selector: 'app-material',
	templateUrl: './material.component.html',
	styleUrl: './material.component.scss'
})
export class MaterialComponent implements OnInit, OnDestroy {
	public rowData: Producto[] = []; // Cambiar de dataProductos a rowData
	public loading = false;
	private gridApi!: GridApi<Producto>;

	public gridOptions: GridOptions = <GridOptions>{
		reactiveCustomComponents: true,
		components: {
			actionCellRenderer: RendererComponent
		},
		context: { componentParent: this }
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
		{
			field: 'nombre',
			headerName: 'Material',
			filter: true,
			floatingFilter: true,
			minWidth: 200,
			tooltipField: 'denominacion',
			wrapText: true,
			autoHeight: true,
			cellRenderer: VerMasRendererComponent,
			cellStyle: {
				'white-space': 'normal',
				'line-height': '1.5',
				'word-break': 'break-word'
			}
			/*filter: true, 
            minWidth: 250, 
            cellRenderer: VerMasRendererComponent,
            floatingFilter: true*/
		},
		{
			field: 'categoria_nombres',
			headerName: 'Categorías',
			filter: true,
			minWidth: 180,
			floatingFilter: true,
			valueGetter: (params) => params.data?.categoria_nombres?.join(', ') || 'Sin categoría'
		},
		{
			field: 'precio_actual',
			headerName: 'Precio',
			filter: true,
			minWidth: 150,
			cellRenderer: (params: any) => {
				const precio = params.value;
				const precioOferta = params.data?.precio_oferta;
				if (precioOferta) {
					return `<span class="text-success fw-bold">$${precio}</span> <span class="text-muted text-decoration-line-through">$${params.data?.precio}</span>`;
				}
				return `<span class="fw-bold">$${precio}</span>`;
			}
		},
		{
			field: 'stock',
			headerName: 'Stock',
			filter: true,
			minWidth: 120,
			cellRenderer: (params: any) => {
				const stock = params.value;
				const stockMinimo = params.data?.stock_minimo || 5;
				let clase = 'text-success';
				if (stock <= 0) {
					clase = 'text-danger';
				} else if (stock <= stockMinimo) {
					clase = 'text-warning';
				}
				return `<span class="${clase} fw-bold">${stock}</span>`;
			}
		},
		{
			field: 'stock_minimo',
			headerName: 'Stock Mínimo',
			filter: true,
			minWidth: 150,
			cellRenderer: (params: any) => {
				const stockMinimo = params.value;
				return `<span class="fw-bold">${stockMinimo}</span>`;
			}
		},
		{
			field: 'destacado',
			headerName: 'Destacado',
			filter: true,
			minWidth: 150,
			cellRenderer: (params: any) => {
				return params.value ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>';
			}
		},
		{
			field: 'oferta',
			headerName: 'Oferta',
			filter: true,
			minWidth: 130,
			cellRenderer: (params: any) => {
				return params.value ? '<span class="badge bg-danger">Sí</span>' : '<span class="badge bg-secondary">No</span>';
			}
		},
		{
			field: 'activo',
			headerName: 'Estado',
			filter: true,
			minWidth: 130,
			cellRenderer: (params: any) => {
				return params.value ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>';
			}
		},
		{
			field: 'imagen_principal_url',
			headerName: 'Imagen',
			filter: false,
			minWidth: 100,
			cellRenderer: ImageRendererComponent

		}
	];

	constructor(
		private toastr: ToastrService,
		private dialog: MatDialog,
		private alertService: SwalAlertService,
		private productoService: ProductoService
	) {}

	ngOnInit(): void {
		this.getAllProductos();
	}

	public getAllProductos(): void {
		this.loading = true;
		this.formSubscription = this.productoService.getProductos(1, 100).subscribe({
			next: (response: any) => {
				this.rowData = response.results || response;
				console.log(this.rowData, 'aaaaaaaaaaaaaaaaa');
				this.loading = false;

				if (this.gridApi) {
					this.gridApi.setGridOption('rowData', this.rowData);
				}
			},
			error: (err) => {
				this.rowData = [];
				this.loading = false;
				this.toastr.error(HandleErrorMessage(err), 'Error');
			}
		});
	}

	public accionNuevo(): void {
		const dialogRef = this.dialog.open(MaterialFormComponent, {
			width: '700px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.getAllProductos();
			}
		});
	}

	public OnActionClick(event: any): void {
		const { action, rowId, data } = event;
		if (action?.toLowerCase() === 'edit') {
			this.onActionEditar(data);
		}
		if (action?.toLowerCase() === 'delete') {
			this.onActionEliminar(data);
		}
	}

	public onActionEditar(data: Producto): void {
		const dialogRef = this.dialog.open(MaterialFormComponent, {
			width: '700px',
			disableClose: true,
			data: data
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.getAllProductos();
			}
		});
	}

	public onActionEliminar(data: Producto): void {
		this.alertService.showConfirmationDialog('Eliminar Producto', '¿Está seguro de eliminar este producto?').then((result) => {
			if (result.isConfirmed) {
				Swal.fire({
					title: 'Eliminando...',
					didOpen: () => Swal.showLoading()
				});

				this.productoService.eliminarProducto(data.id).subscribe({
					next: () => {
						this.toastr.success('Producto eliminado correctamente', 'Éxito');
						this.getAllProductos();
						Swal.close();
					},
					error: (err) => {
						this.toastr.error(HandleErrorMessage(err), 'Error');
						Swal.close();
					}
				});
			}
		});
	}

	onGridReady(params: GridReadyEvent<Producto>): void {
		this.gridApi = params.api;
		setTimeout(() => {
			this.gridApi.sizeColumnsToFit();
		}, 100);
	}

	ngOnDestroy(): void {
		this.formSubscription?.unsubscribe();
		this.dialog.closeAll();
	}
}
