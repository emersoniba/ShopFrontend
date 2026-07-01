import { Component, Inject, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Producto, Categoria } from 'src/app/models/producto.models';
import { ProductoService } from 'src/app/services/producto.services';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';

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

    // Catálogos
    public dataCategorias: Categoria[] = [];

    @ViewChild('fileInput') fileInput!: ElementRef;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private productoService: ProductoService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Producto,
        public dialogRef: MatDialogRef<MaterialFormComponent>
    ) {
        this.formRegistro = this.fb.group({
            id: [''],
            nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
            descripcion_corta: ['', [Validators.maxLength(500)]],
            descripcion_larga: [''],
            precio: ['', [Validators.required, Validators.min(0.01)]],
            precio_oferta: [null],
            stock: [0, [Validators.required, Validators.min(0)]],
            stock_minimo: [5, [Validators.required, Validators.min(0)]],
            categoria_ids: [[], Validators.required],
            destacado: [false],
            oferta: [false],
            nuevo: [false],
            mas_vendido: [false],
            activo: [true]
        });
    }

    ngOnInit(): void {
        this.cargarCatalogos();

        if (this.data && this.data.id) {
            this.labelForm = 'Actualizar Producto';
            this.patchFormValues();
        }
    }

    private cargarCatalogos(): void {
        this.productoService.getCategorias().subscribe({
            next: (categorias) => {
                this.dataCategorias = categorias;
            },
            error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    private patchFormValues(): void {
        // Obtener IDs de categorías
        let categoriaIds = this.data.categoria_ids || [];
        if (!categoriaIds.length && this.data.categorias) {
            categoriaIds = this.data.categorias.map((c) => c.id);
        }

        this.formRegistro.patchValue({
            id: this.data.id,
            nombre: this.data.nombre,
            descripcion_corta: this.data.descripcion_corta,
            descripcion_larga: this.data.descripcion_larga,
            precio: this.data.precio,
            precio_oferta: this.data.precio_oferta,
           // stock: this.data.stock,
           // stock_minimo: this.data.stock_minimo,
            categoria_ids: categoriaIds,
            destacado: this.data.destacado,
            oferta: this.data.oferta,
           // nuevo: this.data.nuevo,
           // mas_vendido: this.data.mas_vendido,
            activo: this.data.activo
        });

        // Cargar la imagen actual si existe
        if (this.data.imagen_principal_url && this.data.imagen_principal_url !== 'null') {
            this.currentImageUrl = this.data.imagen_principal_url;
            this.previewImageUrl = this.data.imagen_principal_url;
            this.selectedFileName = 'Imagen actual';
        }
    }

    public onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                this.toastr.error('Por favor, seleccione solo archivos de imagen', 'Error');
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

            // Crear preview de la nueva imagen
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
        this.selectedFile = null;
        this.selectedFileName = '';
        this.previewImageUrl = '';
        
        // Si había una imagen actual en edición, no la eliminamos del servidor todavía
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
        if (this.formRegistro.invalid) {
            this.formRegistro.markAllAsTouched();
            this.toastr.warning('Complete todos los campos requeridos', 'Validación');
            return;
        }

        this.alertService.showConfirmationDialog(this.labelForm, '¿Está seguro de realizar esta acción?').then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Procesando...',
                    didOpen: () => Swal.showLoading(),
                    allowOutsideClick: false
                });

                this.uploading = true;

                const formValue = this.formRegistro.value;

                // Crear FormData para enviar archivos
                const formData = new FormData();
                formData.append('nombre', formValue.nombre);
                formData.append('descripcion_corta', formValue.descripcion_corta || '');
                formData.append('descripcion_larga', formValue.descripcion_larga || '');
                formData.append('precio', formValue.precio.toString());

                if (formValue.precio_oferta) {
                    formData.append('precio_oferta', formValue.precio_oferta.toString());
                } else {
                    formData.append('precio_oferta', '');
                }

                formData.append('stock', formValue.stock.toString());
                formData.append('stock_minimo', formValue.stock_minimo.toString());
                formData.append('destacado', formValue.destacado ? 'true' : 'false');
                formData.append('oferta', formValue.oferta ? 'true' : 'false');
                formData.append('nuevo', formValue.nuevo ? 'true' : 'false');
                formData.append('mas_vendido', formValue.mas_vendido ? 'true' : 'false');
                formData.append('activo', formValue.activo ? 'true' : 'false');

                // Agregar categorías
                if (formValue.categoria_ids && formValue.categoria_ids.length) {
                    formValue.categoria_ids.forEach((id: number) => {
                        formData.append('categoria_ids', id.toString());
                    });
                }

                // Agregar imagen SOLO si se seleccionó una nueva
                if (this.selectedFile) {
                    formData.append('imagen_principal', this.selectedFile);
                }

                console.log('Enviando datos:', {
                    id: this.data?.id,
                    tieneNuevaImagen: !!this.selectedFile,
                    formData: Array.from(formData.entries())
                });

                if (this.data?.id) {
                    this.productoService.actualizarProducto(this.data.id, formData).subscribe({
                        next: (response) => {
                            this.handleSuccess(response);
                        },
                        error: (err) => {
                            console.error('Error detallado:', err);
                            this.handleError(err);
                        }
                    });
                } else {
                    this.productoService.crearProducto(formData).subscribe({
                        next: (response) => {
                            this.handleSuccess(response);
                        },
                        error: (err) => {
                            console.error('Error detallado:', err);
                            this.handleError(err);
                        }
                    });
                }
            }
        });
    }
    
    private handleSuccess(response: Producto) {
        Swal.close();
        this.uploading = false;
        this.toastr.success('Operación realizada correctamente', 'Éxito');
        this.dialogRef.close(response);
    }

    private handleError(error: any) {
        Swal.close();
        this.uploading = false;
        console.error('Error:', error);
        this.toastr.error(HandleErrorMessage(error), 'Error');
    }

    public accionCancel() {
        this.dialogRef.close(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}