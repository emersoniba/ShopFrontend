// src/app/components/material/material.component.ts
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

import { localeEs } from 'src/app/app.locale.es.grid';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { VerMasRendererComponent } from '../../bandejas/text_expand-render/text-expand-renderer.component';
import { ImageRendererComponent } from '../../bandejas/imagen-render/image-renderer.component';

import { Producto } from 'src/app/models/inventario/producto.model';
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { MaterialFormComponent } from './material-form/material-form.component';

@Component({
    selector: 'app-material',
    templateUrl: './material.component.html',
    styleUrls: ['./material.component.scss']
})
export class MaterialComponent implements OnInit, OnDestroy {
    @ViewChild('agGrid') agGrid: any;

    public rowData: Producto[] = [];
    public loading = false;
    public totalItems = 0;
    public currentPage = 1;
    public pageSize = 20;

    private gridApi!: GridApi<Producto>;
    private subscriptions = new Subscription();

    public searchControl = new FormControl('');

    public gridOptions: GridOptions = {
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent
        },
        context: { componentParent: this },
        rowBuffer: 10,
        rowModelType: 'clientSide',
        cacheBlockSize: 100,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true,
            floatingFilter: true,
        }
    };

    public rowSelection: 'single' = 'single';
    public localEs = localeEs;
    public Math = Math;
    public paginationPageSize = 20;
    public paginationPageSizeSelector = [10, 20, 50, 100];
    public paginationNumberFormatter = (params: PaginationNumberFormatterParams) => params.value.toLocaleString();

    // ==========================================
    // DEFINICIÓN DE COLUMNAS (AG GRID)
    // ==========================================
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
            field: 'imagen_principal',
            headerName: 'Imagen',
            filter: false,
            floatingFilter: false,
            minWidth: 90,
            maxWidth: 90,
            cellRenderer: ImageRendererComponent,
            cellRendererParams: {
                defaultImage: 'assets/images/default-product.png',
                width: 50,
                height: 50,
                borderRadius: '8px'
            }
        },
        {
            field: 'nombre',
            headerName: 'Producto',
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 2,
            wrapText: true,
            autoHeight: true,
            cellRenderer: VerMasRendererComponent
        },
        {
            field: 'categoria_nombre',
            headerName: 'Categoría',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            valueGetter: (params) => params.data?.categoria_nombre || 'Sin categoría',
            cellRenderer: (params: any) => `<span class="badge bg-info text-white">${params.value}</span>`
        },
        {
            field: 'precio_venta',
            headerName: 'Precio Venta',
            filter: 'agNumberColumnFilter',
            minWidth: 170,
            valueFormatter: (params) => `Bs. ${Number(params.value || 0).toFixed(2)}`,
            cellRenderer: (params: any) => `<span class="fw-bold text-primary">Bs. ${Number(params.value || 0).toFixed(2)}</span>`
        },
        {
            field: 'costo_promedio',
            headerName: 'Costo Promedio',
            filter: 'agNumberColumnFilter',
            minWidth: 180,
            valueFormatter: (params) => `Bs. ${Number(params.value || 0).toFixed(2)}`
        },
        {
            field: 'stock_total', // Asume que calculas esto en el frontend o lo manda el backend
            headerName: 'Stock Total',
            filter: 'agNumberColumnFilter',
            minWidth: 180,
            cellRenderer: (params: any) => {
                const stock = params.value || 0;
                // Si el stock es <= 0, mostrar en rojo
                const clase = stock <= 0 ? 'text-danger' : 'text-success';
                const icon = stock <= 0 ? '❌' : '✅';
                return `<span class="${clase} fw-bold">${icon} ${stock}</span>`;
            }
        }
    ];

    constructor(
        private toastr: ToastrService,
        private alertService: SwalAlertService,
        private productoService: ProductoService,
        public dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.cargarProductos();
    }

    public cargarProductos(): void {
        this.loading = true;
        if (this.gridApi) this.gridApi.showLoadingOverlay();

        this.subscriptions.add(
            this.productoService.getProductos().subscribe({
                next: (response: Producto[]) => {
                    this.rowData = response;
                    this.totalItems = response.length;
                    this.loading = false;

                    if (this.gridApi) {
                        this.gridApi.setGridOption('rowData', this.rowData);
                        this.gridApi.hideOverlay();
                    }
                },
                error: (err) => {
                    this.rowData = [];
                    this.loading = false;
                    if (this.gridApi) this.gridApi.hideOverlay();
                    this.toastr.error(HandleErrorMessage(err), 'Error al cargar productos');
                }
            })
        );
    }

    public onActionEliminar(data: Producto): void {
        this.alertService.showConfirmationDialog(
            'Eliminar Producto',
            `¿Está seguro de eliminar el producto "${data.nombre}"?`
        ).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Eliminando...', didOpen: () => Swal.showLoading() });

                this.productoService.deleteProducto(data.id).subscribe({
                    next: () => {
                        this.toastr.success('Producto eliminado correctamente', 'Éxito');
                        this.cargarProductos();
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
    public accionNuevo(): void {
        const dialogRef = this.dialog.open(MaterialFormComponent, {
            width: '750px',
            maxHeight: '70vh',
            disableClose: true,
            data: {}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.cargarProductos();
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
            width: '750px',
            maxHeight: '70vh',
            disableClose: true,
            data: { producto: data }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.cargarProductos();
            }
        });
    }



    exportarExcel() { /* Lógica de exportación */ }
    exportarPDF() { /* Lógica de exportación */ }


    onGridReady(params: GridReadyEvent<Producto>): void {
        this.gridApi = params.api;
        if (this.loading) this.gridApi.showLoadingOverlay();
        setTimeout(() => this.gridApi.sizeColumnsToFit(), 100);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}