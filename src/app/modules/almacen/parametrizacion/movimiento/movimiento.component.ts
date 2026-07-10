// src/app/components/movimientos/movimiento.component.ts
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SwalAlertService } from 'src/app/utils/util.swal';

import { localeEs } from 'src/app/app.locale.es.grid';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { Movimiento } from 'src/app/models/movimientos/movimiento.model';
import { MovimientoService } from 'src/app/services/movimientos/movimiento.service';
import { MovimientoFormComponent } from './movimiento-form/movimiento-form.component';
import { MovimientoDetalleModalComponent } from './movimiento-detalle-modal/movimiento-detalle-modal.component';
import { MovimientoActionRendererComponent } from '../../bandejas/movimiento-action-render/movimiento-action-render.component';

@Component({
    selector: 'app-movimiento',
    templateUrl: './movimiento.component.html',
    styleUrls: ['./movimiento.component.scss']
})
export class MovimientoComponent implements OnInit, OnDestroy {
    @ViewChild('agGrid') agGrid: any;

    public rowData: Movimiento[] = [];
    public loading = false;
    public totalItems = 0;
    public currentPage = 1;
    public pageSize = 20;

    private gridApi!: GridApi<Movimiento>;
    private subscriptions = new Subscription();
    public searchControl = new FormControl('');

    public gridOptions: GridOptions = {
        reactiveCustomComponents: true,
        components: { actionCellRenderer: RendererComponent, MovimientoActionRendererComponent },
        context: { componentParent: this },
        rowModelType: 'clientSide',
        defaultColDef: { sortable: true, resizable: true, filter: true, floatingFilter: true }
    };

    public rowSelection: 'single' = 'single';
    public localEs = localeEs;
    public Math = Math;
    public paginationPageSize = 20;
    public paginationPageSizeSelector = [10, 20, 50, 100];
    public paginationNumberFormatter = (params: PaginationNumberFormatterParams) => params.value.toLocaleString();

    columnDefs: ColDef[] = [
        {
            field: 'id', headerName: 'Opciones',
            filter: false,
            minWidth: 160,
            maxWidth: 160,
            //cellRenderer: RendererComponent, 
            cellRenderer: MovimientoActionRendererComponent,
            pinned: 'left'
        },
        { field: 'id', headerName: 'Nro', filter: 'agNumberColumnFilter', maxWidth: 160 },
        {
            field: 'tipo_movimiento_nombre', headerName: 'Tipo', filter: 'agTextColumnFilter', minWidth: 150,
            cellRenderer: (params: any) => `<span class="fw-bold">${params.value || '-'}</span>`
        },
        {
            field: 'estado_nombre', headerName: 'Estado', filter: 'agTextColumnFilter', minWidth: 120,
            cellRenderer: (params: any) => {
                const isCompletado = params.value === 'Completado';
                return `<span class="badge ${isCompletado ? 'bg-success' : 'bg-warning'}">${params.value}</span>`;
            }
        },
        { field: 'proveedor_nombre', headerName: 'Proveedor', filter: 'agTextColumnFilter', minWidth: 180 },
        {
            field: 'total_movimiento', headerName: 'Total', filter: 'agNumberColumnFilter', minWidth: 130,
            valueFormatter: (params) => `Bs. ${Number(params.value || 0).toFixed(2)}`,
            cellRenderer: (params: any) => `<span class="text-primary fw-bold">Bs. ${Number(params.value || 0).toFixed(2)}</span>`
        },
        {
            field: 'fecha_creacion', headerName: 'Fecha', filter: 'agDateColumnFilter', minWidth: 160,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ''
        }
    ];

    constructor(
        private toastr: ToastrService,
        private movimientoService: MovimientoService,
        public dialog: MatDialog,
        private alertService: SwalAlertService
    ) { }

    ngOnInit(): void {
        this.cargarMovimientos();
    }

    public cargarMovimientos(): void {
        this.loading = true;
        if (this.gridApi) this.gridApi.showLoadingOverlay();

        this.subscriptions.add(
            this.movimientoService.getMovimientos().subscribe({
                next: (res) => {
                    this.rowData = res;
                    this.totalItems = res.length;
                    this.loading = false;
                    if (this.gridApi) this.gridApi.setGridOption('rowData', this.rowData);
                },
                error: (err) => {
                    this.loading = false;
                    this.toastr.error('Error al cargar movimientos');
                }
            })
        );
    }

    public accionNuevo(): void {
        const dialogRef = this.dialog.open(MovimientoFormComponent, {
            width: '800px', // <-- El punto dulce perfecto
            maxWidth: '100vw', // <-- Evita que el modal sea más grande que la pantalla en laptops pequeñas
            maxHeight: '85vh',
            disableClose: true,
            data: {}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.cargarMovimientos();
        });
    }

    public OnActionClick(event: any): void {
        const { action, data } = event;
        const esBorrador = data.estado_nombre.toLowerCase() === 'borrador';
        const esAnulado = data.estado_nombre.toLowerCase() === 'anulado';
        if (action?.toLowerCase() === 'view' || action?.toLowerCase() === 'ver') {
            this.dialog.open(MovimientoDetalleModalComponent, {
                width: '700px',
                maxHeight: '75vh',
                data: data // Pasamos toda la fila, incluyendo los detalles anidados
            });
            return; // Salimos de la función para que no evalúe los otros casos
        }

        if (action?.toLowerCase() === 'edit') {
            if (esBorrador) {
                // Abre el modal pasando los datos
                const dialogRef = this.dialog.open(MovimientoFormComponent, {
                    width: '700px',
                    maxHeight: '75vh',
                    disableClose: true,
                    data: { movimiento: data }
                });
                dialogRef.afterClosed().subscribe(res => { if (res) this.cargarMovimientos(); });
            } else {
                this.toastr.warning('Solo los borradores pueden ser editados.');
            }
        }

        if (action?.toLowerCase() === 'delete') {
            if (esBorrador) {
                this.onActionEliminar(data);
            } else if (esAnulado) {
                this.toastr.info('Este movimiento ya está anulado.');
            } else {
                // Si está completado, disparamos la alerta de ANULACIÓN
                this.onActionAnular(data);
            }
        }
    }

    // Nueva función para anular
    public onActionAnular(data: Movimiento): void {
        this.alertService.showConfirmationDialog(
            'Anular Movimiento',
            `¿Está seguro de anular el movimiento Nro ${data.id}? Esta acción revertirá el stock de los productos afectados.`
        ).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Anulando y revirtiendo stock...', didOpen: () => Swal.showLoading() });
                this.movimientoService.anularMovimiento(data.id).subscribe({
                    next: () => {
                        this.toastr.success('Movimiento anulado correctamente');
                        this.cargarMovimientos();
                        Swal.close();
                    },
                    error: (err) => {
                        this.toastr.error('Error al anular el movimiento');
                        Swal.close();
                    }
                });
            }
        });
    }

    public onActionEliminar(data: Movimiento): void {
        this.alertService.showConfirmationDialog(
            'Eliminar Borrador',
            `¿Está seguro de eliminar este movimiento?`
        ).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Eliminando...', didOpen: () => Swal.showLoading() });
                this.movimientoService.deleteMovimiento(data.id).subscribe({
                    next: () => {
                        this.toastr.success('Borrador eliminado correctamente');
                        this.cargarMovimientos();
                        Swal.close();
                    },
                    error: (err) => {
                        this.toastr.error('Ocurrió un error');
                        Swal.close();
                    }
                });
            }
        });
    }

    onGridReady(params: GridReadyEvent<Movimiento>): void {
        this.gridApi = params.api;
        if (this.loading) this.gridApi.showLoadingOverlay();
        setTimeout(() => this.gridApi.sizeColumnsToFit(), 100);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}