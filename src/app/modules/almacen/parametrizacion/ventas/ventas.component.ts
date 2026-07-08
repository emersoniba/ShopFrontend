// src/app/components/ventas/ventas.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { ProductoService } from 'src/app/services/inventario/producto.service';
import { AlmacenService } from 'src/app/services/inventario/almacen.service';
import { Producto } from 'src/app/models/inventario/producto.model';
import { VentasService } from 'src/app/services/ventas/ventas.services';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {
  public productos: Producto[] = [];
  public productosFiltrados: Producto[] = [];
  public carrito: any[] = [];

  public clientes: any[] = [];
  public almacenes: any[] = [];
  public metodosPago: any[] = [];

  public ventaForm!: FormGroup;
  //public terminoBusqueda: string = '';
  public procesando: boolean = false;
  // NUEVAS VARIABLES PARA LOS FILTROS
  public categoriasUnicas: string[] = ['Todos'];
  public categoriaSeleccionada: string = 'Todos';
  public terminoBusqueda: string = '';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private almacenService: AlmacenService,
    private ventasService: VentasService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarDatosBase();
  }

  private initForm(): void {
    this.ventaForm = this.fb.group({
      cliente: [null, Validators.required],
      almacen: [null, Validators.required], // La barra de donde salen las bebidas
      metodo_pago: [null, Validators.required]
    });
  }

  private cargarDatosBase(): void {
    // Cargamos productos activos
    this.productoService.getProductos(true).subscribe(res => {
      //this.productos = res;
      //this.productosFiltrados = res;
      this.productos = res;
      this.extraerCategorias();
      this.aplicarFiltros();
    });

    this.almacenService.getAlmacenes().subscribe(res => this.almacenes = res);
    this.ventasService.getClientes().subscribe(res => this.clientes = res);
    this.ventasService.getMetodosPago().subscribe(res => this.metodosPago = res);
  }

  //
  private extraerCategorias(): void {
    // Obtenemos los nombres de las categorías y eliminamos duplicados usando Set
    const categorias = this.productos.map(p => p.categoria_nombre || 'Otros');
    this.categoriasUnicas = ['Todos', ...new Set(categorias)];
  }

  public seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltros();
  }

  public buscarProducto(event: any): void {
    this.terminoBusqueda = event.target.value.toLowerCase();
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const nombreCat = p.categoria_nombre || 'Otros';

      // 1. Filtro por Categoría (Tab)
      const coincideCategoria = this.categoriaSeleccionada === 'Todos' || nombreCat === this.categoriaSeleccionada;

      // 2. Filtro por Texto (Buscador)
      const coincideTexto = p.nombre.toLowerCase().includes(this.terminoBusqueda) ||
        nombreCat.toLowerCase().includes(this.terminoBusqueda);

      return coincideCategoria && coincideTexto;
    });
  }
  // 
 /* public buscarProducto(event: any): void {
    const termino = event.target.value.toLowerCase();
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(termino) ||
      (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(termino))
    );
  }
*/
  public agregarAlCarrito(producto: Producto): void {
    const stockTotal = Number(producto.stock_total || 0);

    // Validación de stock
    if (stockTotal <= 0) {
      this.toastr.warning(`No hay stock disponible de ${producto.nombre}`);
      return;
    }

    const itemExistente = this.carrito.find(item => item.producto_id === producto.id);

    if (itemExistente) {
      if (itemExistente.cantidad >= stockTotal) {
        this.toastr.warning('No puedes exceder el stock disponible');
        return;
      }
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * Number(itemExistente.precio_unitario);
    } else {
      this.carrito.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precio_unitario: Number(producto.precio_venta),
        subtotal: Number(producto.precio_venta),       
        imagen: producto.imagen_principal,
        stock_maximo: stockTotal
      });
    }
  }

  public cambiarCantidad(index: number, delta: number): void {
    const item = this.carrito[index];
    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito(index);
      return;
    }

    if (nuevaCantidad > item.stock_maximo) {
      this.toastr.warning('Has alcanzado el límite del stock');
      return;
    }

    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * Number(item.precio_unitario)
  }

  public eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
  }

 public get totalCarrito(): number {
    return this.carrito.reduce((sum, item) => sum + Number(item.subtotal), 0);
  }

  public procesarVenta(): void {
    if (this.ventaForm.invalid || this.carrito.length === 0) {
      this.ventaForm.markAllAsTouched();
      this.toastr.error('Seleccione cliente, método de pago, almacén y al menos un producto.');
      return;
    }

    Swal.fire({
      title: '¿Confirmar Venta?',
      text: `El total a cobrar es Bs. ${this.totalCarrito.toFixed(2)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cobrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarVenta();
      }
    });
  }

  private ejecutarVenta(): void {
    this.procesando = true;
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });

    const payload = {
      cliente: this.ventaForm.value.cliente,
      almacen: this.ventaForm.value.almacen,
      metodo_pago: this.ventaForm.value.metodo_pago,
      total: this.totalCarrito,
      detalles: this.carrito.map(item => ({
        producto: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };

    this.ventasService.registrarVenta(payload).subscribe({
      next: (res) => {
        Swal.fire('¡Venta Exitosa!', 'El stock ha sido descontado correctamente.', 'success');
        this.carrito = []; // Limpiamos carrito
        this.ventaForm.reset(); // Limpiamos formulario
        this.cargarDatosBase(); // Recargamos productos para actualizar el stock visible
        this.procesando = false;
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo procesar la venta.', 'error');
        this.procesando = false;
      }
    });
  }
}