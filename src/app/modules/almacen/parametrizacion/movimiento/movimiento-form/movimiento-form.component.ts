// src/app/components/movimientos/movimiento-form/movimiento-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { MovimientoService } from 'src/app/services/movimientos/movimiento.service';
import { MovimientosCatalogosService } from 'src/app/services/movimientos/movimientos-catalogos.service';
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { AlmacenService } from 'src/app/services/inventario/almacen.service';

import { MovimientoDTO } from 'src/app/models/movimientos/movimiento.model';
import { MovimientoDetalleDTO } from 'src/app/models/movimientos/movimiento-detalle.model';

@Component({
    selector: 'app-movimiento-form',
    templateUrl: './movimiento-form.component.html',
    styleUrls: ['./movimiento-form.component.scss']
})
export class MovimientoFormComponent implements OnInit {
    public formCabecera!: FormGroup;
    public loading = false;
    public isEdit = false;

    // Catálogos
    public tiposMovimiento: any[] = [];
    public estados: any[] = [];
    public proveedores: any[] = [];
    public almacenes: any[] = [];
    public productos: any[] = [];

    // Controles sueltos para el "carrito"
    //public productoControl = new FormControl(null);
    //public cantidadControl = new FormControl(1, [Validators.required, Validators.min(0.01)]);
    //public precioControl = new FormControl(0, [Validators.required, Validators.min(0)]);

    // Controles para la calculadora de empaques/cajas
    public productoControl = new FormControl(null);
    public cantidadPaquetesControl = new FormControl(1, [Validators.required, Validators.min(0.01)]);
    public unidadesPorPaqueteControl = new FormControl(1, [Validators.required, Validators.min(1)]);
    public costoPorPaqueteControl = new FormControl(0, [Validators.required, Validators.min(0)]);

    // El arreglo que guarda temporalmente los productos antes de enviarlos a la BD
    public detalles: (MovimientoDetalleDTO & { producto_nombre?: string })[] = [];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<MovimientoFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private movimientoService: MovimientoService,
        private catalogosService: MovimientosCatalogosService,
        private productoService: ProductoService,
        private almacenService: AlmacenService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.cargarCatalogos();
        // Lógica de precarga para edición
        if (this.data && this.data.movimiento) {
            this.isEdit = true;
            this.cargarDatos(this.data.movimiento);
        }

    }
    private cargarDatos(mov: any): void {
        this.formCabecera.patchValue({
            tipo_movimiento: mov.tipo_movimiento,
            estado: mov.estado,
            proveedor: mov.proveedor,
            almacen_origen: mov.almacen_origen,
            almacen_destino: mov.almacen_destino,
            observacion: mov.observacion
        });

        // Llenamos el carrito con los detalles guardados
        this.detalles = mov.detalles.map((d: any) => ({
            producto: d.producto,
            producto_nombre: d.producto_nombre,
            cantidad: Number(d.cantidad),
            precio_unitario_compra: Number(d.precio_unitario_compra)
        }));
    }
    private initForm(): void {
        this.formCabecera = this.fb.group({
            tipo_movimiento: [null, Validators.required],
            estado: [null, Validators.required],
            proveedor: [null],
            almacen_origen: [null],
            almacen_destino: [null],
            observacion: ['']
        });
    }

    private cargarCatalogos(): void {
        this.catalogosService.getTiposMovimiento().subscribe(res => this.tiposMovimiento = res);
        this.catalogosService.getEstadosMovimiento().subscribe(res => this.estados = res);
        this.catalogosService.getProveedores().subscribe(res => this.proveedores = res);
        this.almacenService.getAlmacenes().subscribe(res => this.almacenes = res);
        this.productoService.getProductos().subscribe(res => this.productos = res);
    }

    public agregarDetalle(): void {
        const prod = this.productoControl.value as any;
        const paquetes = this.cantidadPaquetesControl.value || 0;
        const unidadesPorPaq = this.unidadesPorPaqueteControl.value || 1;
        const costoPaquete = this.costoPorPaqueteControl.value || 0;

        if (!prod || paquetes <= 0) return;

        // CONVERSIÓN CON REDONDEO A 2 DECIMALES
        const cantidadTotalUnidades = Number((paquetes * unidadesPorPaq).toFixed(2));
        const costoUnitarioCalculado = Number((costoPaquete / unidadesPorPaq).toFixed(2));

        const existe = this.detalles.find(d => d.producto === prod.id);
        if (existe) {
            existe.cantidad += cantidadTotalUnidades;
            existe.precio_unitario_compra = costoUnitarioCalculado;
        } else {
            this.detalles.push({
                producto: prod.id,
                producto_nombre: prod.nombre,
                cantidad: cantidadTotalUnidades,
                precio_unitario_compra: costoUnitarioCalculado
            });
        }

        // Limpiar controles
        this.productoControl.reset();
        this.cantidadPaquetesControl.setValue(1);
        this.unidadesPorPaqueteControl.setValue(1);
        this.costoPorPaqueteControl.setValue(0);
    }

    public eliminarDetalle(index: number): void {
        this.detalles.splice(index, 1);
    }

    public calcularTotal(): number {
        return this.detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario_compra), 0);
    }

    public guardarMovimiento(): void {
        if (this.formCabecera.invalid || this.detalles.length === 0) {
            this.toastr.warning('Complete la cabecera y agregue al menos un producto.');
            return;
        }

        this.loading = true;

        // Armamos el JSON final (MovimientoDTO) exactamente como lo configuramos en Django
        const payload: MovimientoDTO = {
            ...this.formCabecera.value,
            total_movimiento: Number(this.calcularTotal().toFixed(2)),
            detalles: this.detalles.map(d => ({
                producto: d.producto,
                cantidad: Number(d.cantidad.toFixed(2)),
                precio_unitario_compra: Number(d.precio_unitario_compra.toFixed(2))
            }))
        };
        if (this.isEdit) {
            this.movimientoService.updateMovimiento(this.data.movimiento.id, payload).subscribe({
                next: (res) => {
                    this.toastr.success('Borrador actualizado con éxito');
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.toastr.error('Error al actualizar');
                    this.loading = false;
                }
            });
        } else {
            this.movimientoService.createMovimiento(payload).subscribe({
                next: (res) => {
                    this.toastr.success('Movimiento registrado y stock actualizado con éxito');
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.toastr.error('Ocurrió un error al registrar el movimiento');
                    this.loading = false;
                }
            });
        }
    }
}