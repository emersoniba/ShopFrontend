// src/app/components/material/material.component.ts
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Subscription, combineLatest, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { localeEs } from 'src/app/app.locale.es.grid';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
//import { MaterialFormComponent } from './material-form/material-form.component';
import { VerMasRendererComponent } from '../../bandejas/text_expand-render/text-expand-renderer.component';
import { ImageRendererComponent } from '../../bandejas/imagen-render/image-renderer.component';
import { FormControl } from '@angular/forms';
import { 
    ProductoService, 
    CategoriaService, 
    UnidadMedidaService,
    TipoProductoService,
    AlmacenService 
} from 'src/app/services';
import { Almacen } from 'src/app/models/almacen.model';
import { StockAlmacen } from 'src/app/models/stock-almacen.model';
import { Producto } from 'src/app/models/producto.model';

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

    // Filtros
    public searchControl = new FormControl('');
    public filtroCategoria: number | null = null;
    public filtroTipoProducto: number | null = null;
    public filtroAlmacen: number | null = null;
    public filtroStockBajo = false;
    public filtroSinStock = false;
    public filtroOfertas = false;
    public filtroDestacados = false;
    public filtroActivos = true;

    // Datos para filtros
    public categorias: any[] = [];
    public tiposProducto: any[] = [];
    public almacenes: Almacen[] = [];

    public gridOptions: GridOptions = {
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent
        },
        context: { componentParent: this },
        rowBuffer: 10,
        rowModelType: 'clientSide',
        cacheBlockSize: 100,
        maxConcurrentDatasourceRequests: 1,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true,
            floatingFilter: true,
        },
        onGridReady: (params) => {
            this.gridApi = params.api;
            this.gridApi.sizeColumnsToFit();
            this.cargarProductos();
        }
    };

    public rowSelection: 'single' = 'single';
    public localEs = localeEs;
    public Math = Math;
    public paginationPageSize = 20;
    public paginationPageSizeSelector: number[] | boolean = [10, 20, 50, 100];
    public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
        return params.value.toLocaleString();
    };

    columnDefs: (ColDef | ColGroupDef)[] = [
        // 1. COLUMNA DE ACCIONES
        {
            field: 'id',
            headerName: '',
            filter: false,
            floatingFilter: false,
            minWidth: 130,
            maxWidth: 130,
            cellRenderer: RendererComponent,
            pinned: 'left',
            cellRendererParams: {
                acciones: [
                    { icono: 'ti ti-eye', nombre: 'Ver', accion: 'view' },
                    { icono: 'ti ti-edit', nombre: 'Editar', accion: 'edit' },
                    { icono: 'ti ti-trash', nombre: 'Eliminar', accion: 'delete' }
                ]
            }
        },
        
        // 2. IMAGEN
        {
            field: 'imagen_principal',
            headerName: 'Imagen',
            filter: false,
            floatingFilter: false,
            minWidth: 80,
            maxWidth: 80,
            cellRenderer: ImageRendererComponent,
            cellRendererParams: {
                defaultImage: 'assets/images/default-product.png',
                width: 50,
                height: 50,
                borderRadius: '8px'
            }
        },

        // 3. INFORMACIÓN BÁSICA DEL PRODUCTO
        {
            field: 'nombre',
            headerName: 'Producto',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 200,
            flex: 2,
            wrapText: true,
            autoHeight: true,
            cellRenderer: VerMasRendererComponent,
            cellStyle: {
                'white-space': 'normal',
                'line-height': '1.5',
                'word-break': 'break-word'
            }
        },

        // 4. CÓDIGO DE BARRAS (opcional)
        {
            field: 'codigo_barras',
            headerName: 'Código',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 120,
            maxWidth: 150,
            hide: true, // Oculto por defecto
            valueGetter: (params) => params.data?.codigo_barras || '---'
        },

        // 5. TIPO DE PRODUCTO
        {
            field: 'tipo_producto_nombre',
            headerName: 'Tipo',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 130,
            maxWidth: 180,
            valueGetter: (params) => params.data?.tipo_producto_nombre || '---',
            cellRenderer: (params: any) => {
                const tipo = params.value;
                const icon = tipo === 'Insumo' ? '📦' : 
                            tipo === 'Venta Directa' ? '🍺' : 
                            tipo === 'Preparado' ? '🍹' : '📋';
                return `<span>${icon} ${tipo}</span>`;
            }
        },

        // 6. CATEGORÍA
        {
            field: 'categoria_nombre',
            headerName: 'Categoría',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 150,
            maxWidth: 200,
            valueGetter: (params) => params.data?.categoria_nombre || 'Sin categoría',
            cellRenderer: (params: any) => {
                const categoria = params.value;
                return `<span class="badge bg-info text-white">${categoria}</span>`;
            }
        },

        // 7. UNIDAD DE MEDIDA
        {
            field: 'unidad_abreviatura',
            headerName: 'Unidad',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 100,
            maxWidth: 130,
            valueGetter: (params) => params.data?.unidad_abreviatura || '---'
        },

        // 8. CAPACIDAD
        {
            field: 'capacidad',
            headerName: 'Capacidad',
            filter: 'agNumberColumnFilter',
            floatingFilter: true,
            minWidth: 100,
            maxWidth: 130,
            valueGetter: (params) => params.data?.capacidad || 1,
            valueFormatter: (params) => {
                const capacidad = params.value || 1;
                return `${capacidad}`;
            }
        },

        // 9. PRECIOS
        {
            headerName: '💰 Precios',
            children: [
                {
                    field: 'precio_venta',
                    headerName: 'Venta',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    minWidth: 120,
                    maxWidth: 150,
                    valueFormatter: (params) => {
                        const precio = params.value || 0;
                        return `Bs. ${precio.toFixed(2)}`;
                    },
                    cellRenderer: (params: any) => {
                        const precio = params.value || 0;
                        const tieneOferta = params.data?.oferta_activa;
                        const precioOferta = params.data?.precio_oferta;
                        
                        if (tieneOferta && precioOferta) {
                            return `
                                <div class="d-flex flex-column">
                                    <span class="text-danger fw-bold">Bs. ${precioOferta.toFixed(2)}</span>
                                    <span class="text-muted text-decoration-line-through small">Bs. ${precio.toFixed(2)}</span>
                                </div>
                            `;
                        }
                        return `<span class="fw-bold text-primary">Bs. ${precio.toFixed(2)}</span>`;
                    }
                },
                {
                    field: 'costo_promedio',
                    headerName: 'Costo',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    minWidth: 120,
                    maxWidth: 150,
                    valueFormatter: (params) => {
                        const costo = params.value || 0;
                        return `Bs. ${costo.toFixed(2)}`;
                    },
                    cellRenderer: (params: any) => {
                        const costo = params.value || 0;
                        const margen = params.data?.precio_venta ? 
                            ((params.data.precio_venta - costo) / params.data.precio_venta * 100).toFixed(1) : '0';
                        
                        const color = parseFloat(margen) > 40 ? 'success' : 
                                     parseFloat(margen) > 20 ? 'warning' : 'danger';
                        
                        return `
                            <div class="d-flex flex-column">
                                <span>Bs. ${costo.toFixed(2)}</span>
                                <small class="text-${color}">Margen: ${margen}%</small>
                            </div>
                        `;
                    }
                }
            ]
        },

        // 10. STOCK
        {
            headerName: '📦 Stock',
            children: [
                {
                    field: 'stock_total',
                    headerName: 'Total',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    minWidth: 100,
                    maxWidth: 120,
                    valueGetter: (params) => {
                        const stocks = params.data?.stocks || [];
                        return stocks.reduce((sum: number, s: StockAlmacen) => sum + (s.cantidad || 0), 0);
                    },
                    cellRenderer: (params: any) => {
                        const stock = params.value || 0;
                        const stockMinimo = params.data?.stock_minimo || 5;
                        let clase = 'text-success';
                        let icon = '✅';
                        
                        if (stock <= 0) {
                            clase = 'text-danger';
                            icon = '❌';
                        } else if (stock <= stockMinimo) {
                            clase = 'text-warning';
                            icon = '⚠️';
                        }
                        
                        return `<span class="${clase} fw-bold">${icon} ${stock}</span>`;
                    }
                },
                {
                    field: 'stock_minimo',
                    headerName: 'Mínimo',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    minWidth: 100,
                    maxWidth: 120,
                    valueGetter: (params) => params.data?.stock_minimo || 5,
                    valueFormatter: (params) => `${params.value || 5}`
                },
                {
                    field: 'stocks_detalle',
                    headerName: 'Por Almacén',
                    filter: false,
                    floatingFilter: false,
                    minWidth: 200,
                    flex: 1.5,
                    autoHeight: true,
                    valueGetter: (params) => params.data?.stocks || [],
                    cellRenderer: (params: any) => {
                        const stocks: StockAlmacen[] = params.value || [];
                        if (stocks.length === 0) {
                            return '<span class="text-muted small">Sin distribución</span>';
                        }

                        let html = '<div class="d-flex flex-wrap gap-1">';
                        
                        stocks.forEach(s => {
                            const stock = s.cantidad || 0;
                            const minimo = s.stock_minimo || 5;
                            let clase = 'text-success';
                            let icon = '✅';
                            
                            if (stock <= 0) {
                                clase = 'text-danger';
                                icon = '❌';
                            } else if (stock <= minimo) {
                                clase = 'text-warning';
                                icon = '⚠️';
                            }

                            const tipoIcon = s.almacen_tipo_nombre === 'VIP' ? '⭐' :
                                            s.almacen_tipo_nombre === 'BARRA' ? '🍺' :
                                            s.almacen_tipo_nombre === 'EVENTO' ? '🎪' : '🏠';

                            html += `
                                <span class="badge bg-light text-dark" style="font-weight: normal;">
                                    ${tipoIcon} ${s.almacen_nombre}: 
                                    <span class="${clase} fw-bold">${stock}</span>
                                    ${stock <= minimo ? `<span class="text-warning">🔔</span>` : ''}
                                </span>
                            `;
                        });

                        html += '</div>';
                        return html;
                    }
                }
            ]
        },

        // 11. OFERTA
        {
            field: 'oferta_activa',
            headerName: 'Oferta',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 100,
            maxWidth: 120,
            valueGetter: (params) => params.data?.oferta_activa || false,
            cellRenderer: (params: any) => {
                return params.value ?
                    '<span class="badge bg-danger"><i class="ti ti-tag"></i> Activa</span>' :
                    '<span class="badge bg-secondary">Normal</span>';
            }
        },

        // 12. ESTADO
        {
            field: 'activo',
            headerName: 'Estado',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 120,
            maxWidth: 140,
            valueGetter: (params) => params.data?.activo ?? true,
            cellRenderer: (params: any) => {
                const activo = params.value;
                return activo ?
                    '<span class="badge bg-success"><i class="ti ti-circle-check"></i> Activo</span>' :
                    '<span class="badge bg-danger"><i class="ti ti-circle-x"></i> Inactivo</span>';
            }
        },

        // 13. FECHA DE CREACIÓN
        {
            field: 'fecha_creacion',
            headerName: 'Creado',
            filter: 'agDateColumnFilter',
            floatingFilter: true,
            minWidth: 150,
            maxWidth: 180,
            valueFormatter: (params) => {
                const fecha = params.value;
                if (!fecha) return '---';
                const date = new Date(fecha);
                return date.toLocaleDateString('es-BO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },

        // 14. ÚLTIMA ACTUALIZACIÓN
        {
            field: 'fecha_modificacion',
            headerName: 'Actualizado',
            filter: 'agDateColumnFilter',
            floatingFilter: true,
            minWidth: 150,
            maxWidth: 180,
            valueFormatter: (params) => {
                const fecha = params.value;
                if (!fecha) return '---';
                const date = new Date(fecha);
                return date.toLocaleDateString('es-BO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
    ];

    constructor(
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService,
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private tipoProductoService: TipoProductoService,
        private almacenService: AlmacenService,
        private unidadMedidaService: UnidadMedidaService
    ) {}

    ngOnInit(): void {
        this.cargarDatosIniciales();
        this.configurarFiltros();
    }

    private cargarDatosIniciales(): void {
        this.subscriptions.add(
            combineLatest([
                this.categoriaService.getCategorias().pipe(catchError(() => of([]))),
                this.tipoProductoService.getTiposProducto().pipe(catchError(() => of([]))),
                this.almacenService.getAlmacenes().pipe(catchError(() => of([])))
            ]).subscribe(([categorias, tiposProducto, almacenes]) => {
                this.categorias = categorias;
                this.tiposProducto = tiposProducto;
                this.almacenes = almacenes;
                this.cargarProductos();
            })
        );
    }

    private configurarFiltros(): void {
        this.subscriptions.add(
            this.searchControl.valueChanges.pipe(
                debounceTime(500),
                distinctUntilChanged()
            ).subscribe(() => {
                this.currentPage = 1;
                this.cargarProductos();
            })
        );
    }

    public cargarProductos(): void {
        this.loading = true;
        if (this.gridApi) {
            this.gridApi.showLoadingOverlay();
        }

        const params: any = {
            page: this.currentPage,
            page_size: this.pageSize,
            ordering: '-fecha_creacion'
        };

        // Aplicar filtros
        if (this.searchControl.value) {
            params.search = this.searchControl.value;
        }
        if (this.filtroCategoria) {
            params.categoria = this.filtroCategoria;
        }
        if (this.filtroTipoProducto) {
            params.tipo_producto = this.filtroTipoProducto;
        }
        if (this.filtroAlmacen) {
            params.almacen = this.filtroAlmacen;
        }
        if (this.filtroStockBajo) {
            params.stock_bajo = true;
        }
        if (this.filtroSinStock) {
            params.sin_stock = true;
        }
        if (this.filtroOfertas) {
            params.ofertas = true;
        }
        if (this.filtroDestacados) {
            params.destacados = true;
        }
        if (this.filtroActivos !== null && this.filtroActivos !== undefined) {
            params.activo = this.filtroActivos;
        }

        this.subscriptions.add(
            this.productoService.getProductos(params).subscribe({
                next: (response) => {
                    this.rowData = response.results;
                    this.totalItems = response.count;
                    this.loading = false;

                    if (this.gridApi) {
                        this.gridApi.setGridOption('rowData', this.rowData);
                        this.gridApi.hideOverlay();
                    }
                },
                error: (err) => {
                    this.rowData = [];
                    this.loading = false;
                    if (this.gridApi) {
                        this.gridApi.hideOverlay();
                    }
                    this.toastr.error(HandleErrorMessage(err), 'Error al cargar productos');
                }
            })
        );
    }

    // ========== ACCIONES ==========
   /* public accionNuevo(): void {
        const dialogRef = this.dialog.open(MaterialFormComponent, {
            width: '900px',
            maxWidth: '95vw',
            disableClose: true,
            data: {
                mode: 'create',
                categorias: this.categorias,
                tiposProducto: this.tiposProducto,
                almacenes: this.almacenes
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.cargarProductos();
        });
    }
*/
    public OnActionClick(event: any): void {
        const { action, data } = event;
        switch (action?.toLowerCase()) {
            case 'view':
               // this.onActionVer(data);
                break;
            case 'edit':
               // this.onActionEditar(data);
                break;
            case 'delete':
                this.onActionEliminar(data);
                break;
            case 'toggle':
                this.onActionToggleActivo(data);
                break;
        }
    }
/*
    public onActionVer(data: Producto): void {
        this.dialog.open(MaterialFormComponent, {
            width: '900px',
            maxWidth: '95vw',
            disableClose: true,
            data: {
                mode: 'view',
                producto: data,
                categorias: this.categorias,
                tiposProducto: this.tiposProducto,
                almacenes: this.almacenes
            }
        });
    }

    public onActionEditar(data: Producto): void {
        const dialogRef = this.dialog.open(MaterialFormComponent, {
            width: '900px',
            maxWidth: '95vw',
            disableClose: true,
            data: {
                mode: 'edit',
                producto: data,
                categorias: this.categorias,
                tiposProducto: this.tiposProducto,
                almacenes: this.almacenes
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.cargarProductos();
        });
    }
*/
    public onActionEliminar(data: Producto): void {
        this.alertService.showConfirmationDialog(
            'Eliminar Producto',
            `¿Está seguro de eliminar el producto "${data.nombre}"? Esta acción no se puede deshacer.`
        ).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Eliminando...',
                    didOpen: () => Swal.showLoading()
                });

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

    public onActionToggleActivo(data: Producto): void {
        const nuevoEstado = !data.activo;
        const mensaje = nuevoEstado ? 'activar' : 'desactivar';
        
        this.alertService.showConfirmationDialog(
            `${nuevoEstado ? 'Activar' : 'Desactivar'} Producto`,
            `¿Está seguro de ${mensaje} el producto "${data.nombre}"?`
        ).then((result) => {
            if (result.isConfirmed) {
                this.productoService.patchProducto(data.id, { activo: nuevoEstado }).subscribe({
                    next: () => {
                        this.toastr.success(`Producto ${mensaje}do correctamente`, 'Éxito');
                        this.cargarProductos();
                    },
                    error: (err) => {
                        this.toastr.error(HandleErrorMessage(err), 'Error');
                    }
                });
            }
        });
    }

    // ========== FILTROS ==========
    public filtrarPorCategoria(categoriaId: number | null): void {
        this.filtroCategoria = categoriaId;
        this.currentPage = 1;
        this.cargarProductos();
    }

    public filtrarPorTipoProducto(tipoId: number | null): void {
        this.filtroTipoProducto = tipoId;
        this.currentPage = 1;
        this.cargarProductos();
    }

    public filtrarPorAlmacen(almacenId: number | null): void {
        this.filtroAlmacen = almacenId;
        this.currentPage = 1;
        this.cargarProductos();
    }

    public toggleStockBajo(): void {
        this.filtroStockBajo = !this.filtroStockBajo;
        if (this.filtroStockBajo) this.filtroSinStock = false;
        this.currentPage = 1;
        this.cargarProductos();
    }

    public toggleSinStock(): void {
        this.filtroSinStock = !this.filtroSinStock;
        if (this.filtroSinStock) this.filtroStockBajo = false;
        this.currentPage = 1;
        this.cargarProductos();
    }

    public toggleOfertas(): void {
        this.filtroOfertas = !this.filtroOfertas;
        this.currentPage = 1;
        this.cargarProductos();
    }

    public toggleDestacados(): void {
        this.filtroDestacados = !this.filtroDestacados;
        this.currentPage = 1;
        this.cargarProductos();
    }

    public toggleActivos(): void {
        this.filtroActivos = !this.filtroActivos;
        this.currentPage = 1;
        this.cargarProductos();
    }

    public limpiarFiltros(): void {
        this.searchControl.setValue('');
        this.filtroCategoria = null;
        this.filtroTipoProducto = null;
        this.filtroAlmacen = null;
        this.filtroStockBajo = false;
        this.filtroSinStock = false;
        this.filtroOfertas = false;
        this.filtroDestacados = false;
        this.filtroActivos = true;
        this.currentPage = 1;
        this.cargarProductos();
    }

    // ========== EXPORTAR DATOS ==========
    public exportarExcel(): void {
        // Implementar exportación a Excel
        this.toastr.info('Función en desarrollo', 'Exportar');
    }

    public exportarPDF(): void {
        // Implementar exportación a PDF
        this.toastr.info('Función en desarrollo', 'Exportar');
    }

    onGridReady(params: GridReadyEvent<Producto>): void {
        this.gridApi = params.api;
        if (this.loading) {
            this.gridApi.showLoadingOverlay();
        }
        setTimeout(() => {
            this.gridApi.sizeColumnsToFit();
        }, 100);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.dialog.closeAll();
    }
}