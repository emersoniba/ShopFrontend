// src/app/components/material/material-form/material-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { Producto, ProductoDTO } from 'src/app/models/inventario/producto.model';
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { CatalogosService } from 'src/app/services/inventario/catalogos.service';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';


@Component({
  selector: 'app-material-form',
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss']
})
export class MaterialFormComponent implements OnInit {
  public labelForm: string = 'Registrar Producto';
  public form!: FormGroup;

  public uploading: boolean = false;

  public isEdit = false;
  public loading = false;

  // Variables para los selects (Catálogos Dinámicos)
  public categorias: any[] = [];
  public tiposProducto: any[] = [];
  public unidadesMedida: any[] = [];

  // Manejo de imagen
  public imagenPreview: string | ArrayBuffer | null = null;
  private imagenSeleccionada: File | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaterialFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { producto?: Producto },
    private productoService: ProductoService,
    private catalogosService: CatalogosService,
    private toastr: ToastrService
  ) {
    this.isEdit = !!data?.producto;
  }

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogos();

    if (this.isEdit && this.data.producto) {
      this.labelForm = 'Actualizar Producto';
      this.cargarDatosProducto(this.data.producto);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      categoria: [null, Validators.required],
      tipo_producto: [null, Validators.required],
      unidad_medida: [null, Validators.required],
      precio_venta: [0, [Validators.required, Validators.min(0)]],
      costo_promedio: [0, [Validators.required, Validators.min(0)]],
      capacidad: [1, [Validators.required, Validators.min(0.01)]],
      activo: [true]
    });
  }

  private cargarCatalogos(): void {
    // Aquí puedes usar forkJoin para optimizar si lo prefieres
    this.catalogosService.getCategorias().subscribe(res => this.categorias = res);
    this.catalogosService.getTiposProducto().subscribe(res => this.tiposProducto = res);
    this.catalogosService.getUnidadesMedida().subscribe(res => this.unidadesMedida = res);
  }

  private cargarDatosProducto(producto: Producto): void {
    this.form.patchValue({
      nombre: producto.nombre,
      categoria: producto.categoria,
      tipo_producto: producto.tipo_producto,
      unidad_medida: producto.unidad_medida,
      precio_venta: producto.precio_venta,
      costo_promedio: producto.costo_promedio,
      capacidad: producto.capacidad,
      activo: producto.activo
    });

    if (producto.imagen_principal) {
      this.imagenPreview = producto.imagen_principal;
    }
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      // Crear vista previa para el usuario
      const reader = new FileReader();
      reader.onload = () => this.imagenPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Al manejar imágenes, usamos FormData en lugar de un JSON normal
    const formData = new FormData();
    const formValues = this.form.value;

    formData.append('nombre', formValues.nombre);
    formData.append('categoria', formValues.categoria);
    formData.append('tipo_producto', formValues.tipo_producto);
    formData.append('unidad_medida', formValues.unidad_medida);
    formData.append('precio_venta', formValues.precio_venta);
    formData.append('costo_promedio', formValues.costo_promedio);
    formData.append('capacidad', formValues.capacidad);
    formData.append('activo', formValues.activo ? 'true' : 'false');

    if (this.imagenSeleccionada) {
      formData.append('imagen_principal', this.imagenSeleccionada);
    }

    if (this.isEdit) {
      this.productoService.updateProducto(this.data.producto!.id, formData).subscribe({
        next: (res) => {
          this.toastr.success('Producto actualizado con éxito');
          this.dialogRef.close(true); // Devolvemos true para que la tabla se actualice
        },
        error: (err) => {
          this.toastr.error('Ocurrió un error al actualizar');
          this.loading = false;
        }
      });
    } else {
      this.productoService.createProducto(formData).subscribe({
        next: (res) => {
          this.toastr.success('Producto creado con éxito');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.toastr.error('Ocurrió un error al guardar');
          this.loading = false;
        }
      });
    }
  }
  public accionCancel() {
    this.dialogRef.close(null);
  }

  private handleError(error: any) {
    Swal.close();
    this.uploading = false;
    console.error('Error:', error);
    this.toastr.error(HandleErrorMessage(error), 'Error');
  }
}