// src/app/components/material/material-form/material-form.component.ts
/*
import { Component, Inject, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription, forkJoin } from 'rxjs';
import { Producto } from 'src/app/models/producto.model';
import { Categoria } from 'src/app/models/categoria.model';
import { Almacen } from 'src/app/models/almacen.model';
import { StockAlmacen } from 'src/app/models/stock-almacen.model';
import { ProductoService } from 'src/app/services/producto.service';
import { CategoriaService } from 'src/app/services/categoria.service';
import { AlmacenService } from 'src/app/services/almacen.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';

interface DialogData {
    mode: 'create' | 'edit' | 'view';
    producto?: Producto;
    categorias?: Categoria[];
    almacenes?: Almacen[];
}

interface StockPorAlmacen {
    almacen_id: number;
    almacen_nombre: string;
    cantidad: number;
    stock_minimo: number;
    stock_maximo: number;
    punto_reorden: number;
}

@Component({
    selector: 'app-material-form',
    templateUrl: './material-form.component.html',
    styleUrl: './material-form.component.scss'
})
export class MaterialFormComponent implements OnInit, OnDestroy {
    public labelForm: string = 'Registrar Producto';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;
    public selectedFileName: string = '';
    public uploading: boolean = false;
    public selectedFile: File | null = null;
    public currentImageUrl: string = '';
    public previewImageUrl: string = '';
    public isViewMode: boolean = false;

    // Catálogos
    public dataCategorias: Categoria[] = [];
    public dataAlmacenes: Almacen[] = [];

    // Stock por almacén (con todos los campos)
    public stockItems: StockPorAlmacen[] = [];

    // Almacén seleccionado para editar stock
    public almacenSeleccionadoId: number | null = null;
    public stockSeleccionado: StockPorAlmacen | null = null;

    @ViewChild('fileInput') fileInput!: ElementRef;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private almacenService: AlmacenService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        public dialogRef: MatDialogRef<MaterialFormComponent>
    ) {
        this.isViewMode = data?.mode === 'view';

        this.formRegistro = this.fb.group({
            id: [''],
            nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
            descripcion_corta: ['', [Validators.maxLength(500)]],
            precio: ['', [Validators.required, Validators.min(0.01)]],
            precio_oferta: [null],
            categoria_ids: [[], Validators.required],
            destacado: [false],
            oferta: [false],
            activo: [true]
        });

        if (this.isViewMode) {
            this.formRegistro.disable();
        }
    }

    ngOnInit(): void {
        this.cargarCatalogos();

        if (this.data?.producto && this.data.producto.id) {
            this.labelForm = this.isViewMode ? 'Ver Producto' : 'Actualizar Producto';
            this.patchFormValues();
        } else {
            this.labelForm = 'Registrar Producto';
            this.inicializarStock();
        }
    }

    private cargarCatalogos(): void {
        if (this.data?.categorias) {
            this.dataCategorias = this.data.categorias;
        }
        if (this.data?.almacenes) {
            this.dataAlmacenes = this.data.almacenes;
            this.inicializarStock();
        }

        if (!this.data?.categorias || !this.data?.almacenes) {
            this.formSubscription = forkJoin({
                categorias: this.categoriaService.getCategorias(),
                almacenes: this.almacenService.getAlmacenes()
            }).subscribe({
                next: (result) => {
                    this.dataCategorias = result.categorias;
                    this.dataAlmacenes = result.almacenes;
                    this.inicializarStock();
                },
                error: (err) => {
                    this.toastr.error(HandleErrorMessage(err), 'Error al cargar catálogos');
                }
            });
        }
    }

    private inicializarStock(): void {
        // Inicializar todos los almacenes con valores por defecto
        this.stockItems = this.dataAlmacenes.map(almacen => ({
            almacen_id: almacen.id,
            almacen_nombre: almacen.nombre,
            cantidad: 0,
            stock_minimo: 5,
            stock_maximo: 100,
            punto_reorden: 10
        }));
    }

    private patchFormValues(): void {
        const producto = this.data.producto!;

        let categoriaIds = producto.categoria_ids || [];
        if (!categoriaIds.length && producto.categorias) {
            categoriaIds = producto.categorias.map((c) => c.id);
        }

        this.formRegistro.patchValue({
            id: producto.id,
            nombre: producto.nombre,
            descripcion_corta: producto.descripcion_corta || '',
            precio: producto.precio,
            precio_oferta: producto.precio_oferta,
            categoria_ids: categoriaIds,
            destacado: producto.destacado || false,
            oferta: producto.oferta || false,
            activo: producto.activo !== undefined ? producto.activo : true
        });

        // Cargar stock por almacén desde el producto
        if (producto.stocks && producto.stocks.length > 0) {
            // Actualizar los valores de cada almacén con los datos del producto
            this.stockItems = this.dataAlmacenes.map(almacen => {
                const stockExistente = producto.stocks.find(s => s.almacen === almacen.id);
                return {
                    almacen_id: almacen.id,
                    almacen_nombre: almacen.nombre,
                    cantidad: stockExistente?.cantidad || 0,
                    stock_minimo: stockExistente?.stock_minimo || 5,
                    stock_maximo: stockExistente?.stock_maximo || 100,
                    punto_reorden: stockExistente?.punto_reorden || 10
                };
            });
        }

        // Imagen actual
        if (producto.imagen_principal_url && producto.imagen_principal_url !== 'null') {
            this.currentImageUrl = producto.imagen_principal_url;
            this.previewImageUrl = producto.imagen_principal_url;
            this.selectedFileName = 'Imagen actual';
        }
    }

    // ========== MÉTODOS PARA SELECCIONAR ALMACÉN ==========

    public seleccionarAlmacen(almacenId: number): void {
        if (this.isViewMode) return;

        this.almacenSeleccionadoId = almacenId;
        this.stockSeleccionado = this.stockItems.find(s => s.almacen_id === almacenId) || null;
    }

    public actualizarCantidad(event: any): void {
        if (this.stockSeleccionado) {
            this.stockSeleccionado.cantidad = +event.target.value || 0;
        }
    }

    public actualizarStockMinimo(event: any): void {
        if (this.stockSeleccionado) {
            this.stockSeleccionado.stock_minimo = +event.target.value || 0;
        }
    }

    public actualizarStockMaximo(event: any): void {
        if (this.stockSeleccionado) {
            this.stockSeleccionado.stock_maximo = +event.target.value || 0;
        }
    }

    public actualizarPuntoReorden(event: any): void {
        if (this.stockSeleccionado) {
            this.stockSeleccionado.punto_reorden = +event.target.value || 0;
        }
    }

    public onFileSelected(event: any): void {
        if (this.isViewMode) return;

        const file = event.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                this.toastr.error('Seleccione solo archivos de imagen', 'Error');
                this.resetFileInput();
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.toastr.error('La imagen no debe exceder los 5MB', 'Error');
                this.resetFileInput();
                return;
            }

            this.selectedFile = file;
            this.selectedFileName = file.name;

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previewImageUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    public onImageError(): void {
        this.previewImageUrl = 'assets/images/producto.png';
    }

    public removeImage(): void {
        if (this.isViewMode) return;

        this.selectedFile = null;
        this.selectedFileName = '';
        this.previewImageUrl = '';

        if (this.currentImageUrl) {
            this.previewImageUrl = this.currentImageUrl;
            this.selectedFileName = 'Imagen actual';
        }

        this.resetFileInput();
    }

    private resetFileInput(): void {
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    public accionRegistrar() {
        if (this.isViewMode) {
            this.dialogRef.close(null);
            return;
        }

        if (this.formRegistro.invalid) {
            this.formRegistro.markAllAsTouched();
            this.toastr.warning('Complete todos los campos requeridos', 'Validación');
            return;
        }

        this.alertService.showConfirmationDialog(this.labelForm, '¿Está seguro de realizar esta acción?').then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Procesando...',
                    didOpen: () => Swal.showLoading(),
                    allowOutsideClick: false
                });

                this.uploading = true;

                const formValue = this.formRegistro.value;
                const formData = new FormData();

                // Datos básicos
                formData.append('nombre', formValue.nombre);
                formData.append('descripcion_corta', formValue.descripcion_corta || '');
                formData.append('precio', formValue.precio.toString());

                if (formValue.precio_oferta) {
                    formData.append('precio_oferta', formValue.precio_oferta.toString());
                }

                formData.append('destacado', formValue.destacado ? 'true' : 'false');
                formData.append('oferta', formValue.oferta ? 'true' : 'false');
                formData.append('activo', formValue.activo ? 'true' : 'false');

                // Categorías
                if (formValue.categoria_ids && formValue.categoria_ids.length) {
                    formValue.categoria_ids.forEach((id: number) => {
                        formData.append('categoria_ids', id.toString());
                    });
                }

                // Imagen
                if (this.selectedFile) {
                    formData.append('imagen_principal', this.selectedFile);
                }

                // Stock por almacén - Enviar TODOS los almacenes con sus datos
                this.stockItems.forEach(item => {
                    // Solo enviar si tiene cantidad > 0 o si estamos actualizando
                    formData.append(`stock_${item.almacen_id}`, item.cantidad.toString());
                    formData.append(`stock_minimo_${item.almacen_id}`, item.stock_minimo.toString());
                    formData.append(`stock_maximo_${item.almacen_id}`, item.stock_maximo.toString());
                    formData.append(`punto_reorden_${item.almacen_id}`, item.punto_reorden.toString());
                });

                const request = this.data?.producto?.id
                    ? this.productoService.updateProducto(this.data.producto.id, formData)
                    : this.productoService.createProducto(formData);

                request.subscribe({
                    next: (response) => {
                        Swal.close();
                        this.uploading = false;
                        this.toastr.success('Operación realizada correctamente', 'Éxito');
                        this.dialogRef.close(response);
                    },
                    error: (err) => {
                        Swal.close();
                        this.uploading = false;
                        console.error('Error:', err);
                        this.toastr.error(HandleErrorMessage(err), 'Error');
                    }
                });
            }
        });
    }

    public accionCancel() {
        this.dialogRef.close(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}*/