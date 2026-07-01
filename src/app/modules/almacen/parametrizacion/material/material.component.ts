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
import { Producto, StockAlmacen } from 'src/app/models/producto.models';
import { ProductoService } from 'src/app/services/producto.services';
import { VerMasRendererComponent } from '../../bandejas/text_expand-render/text-expand-renderer.component';
import { ImageRendererComponent } from '../../bandejas/imagen-render/image-renderer.component';

@Component({
	selector: 'app-material',
	templateUrl: './material.component.html',
	styleUrl: './material.component.scss'
})
export class MaterialComponent implements OnInit, OnDestroy {
	public rowData: Producto[] = [];
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
			headerName: 'Producto',
			filter: true,
			floatingFilter: true,
			minWidth: 200,
			wrapText: true,
			autoHeight: true,
			cellRenderer: VerMasRendererComponent,
			cellStyle: {
				'white-space': 'normal',
				'line-height': '1.5',
				'word-break': 'break-word'
			}
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
			minWidth: 120,
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
			field: 'stock_total',
			headerName: 'Stock Global',
			filter: 'agNumberColumnFilter',
			minWidth: 130,
			cellRenderer: (params: any) => {
				const stock = params.value || 0;
				let clase = stock <= 0 ? 'text-danger' : 'text-success';
				return `<span class="${clase} fw-bold fs-6">${stock} u.</span>`;
			}
		},
		{
			field: 'stocks',
			headerName: 'Detalle por Almacenes',
			filter: false,
			minWidth: 250,
			autoHeight: true,
			cellRenderer: (params: any) => {
				const stocks: StockAlmacen[] = params.value || [];
				if (stocks.length === 0) return '<span class="text-muted small">Sin distribución</span>';
				
				// Formatea el arreglo de stocks en una lista HTML pequeña
				let html = '<ul class="mb-0 ps-3 small" style="list-style-type: disc;">';
				stocks.forEach(s => {
					html += `<li><b>${s.almacen_nombre}:</b> ${s.cantidad}</li>`;
				});
				html += '</ul>';
				return html;
			}
		},
		{
			field: 'oferta',
			headerName: 'Oferta',
			filter: true,
			minWidth: 100,
			cellRenderer: (params: any) => {
				return params.value ? '<span class="badge bg-danger">Sí</span>' : '<span class="badge bg-secondary">No</span>';
			}
		},
		{
			field: 'activo',
			headerName: 'Estado',
			filter: true,
			minWidth: 100,
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
		// Solicitamos una página grande para que AG Grid pagine la data en memoria (Client-Side)
		this.formSubscription = this.productoService.getProductos(1, 200).subscribe({
			next: (response: any) => {
				this.rowData = response.results || response;
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
			width: '800px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) this.getAllProductos();
		});
	}

	public OnActionClick(event: any): void {
		const { action, data } = event;
		if (action?.toLowerCase() === 'edit') this.onActionEditar(data);
		if (action?.toLowerCase() === 'delete') this.onActionEliminar(data);
	}

	public onActionEditar(data: Producto): void {
		const dialogRef = this.dialog.open(MaterialFormComponent, {
			width: '800px',
			disableClose: true,
			data: data
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) this.getAllProductos();
		});
	}

	public onActionEliminar(data: Producto): void {
		this.alertService.showConfirmationDialog('Eliminar Producto', '¿Está seguro de eliminar este producto?').then((result) => {
			if (result.isConfirmed) {
				Swal.fire({ title: 'Eliminando...', didOpen: () => Swal.showLoading() });

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