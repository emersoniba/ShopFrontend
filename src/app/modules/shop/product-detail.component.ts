import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Producto, Categoria } from 'src/app/models/producto.models';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from 'src/app/services/producto.services';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    // Productos
    productos: Producto[] = [];
    productosDestacados: Producto[] = [];
    productosOfertas: Producto[] = [];
    productosRecomendados: Producto[] = [];
    categorias: Categoria[] = [];

    // Estado
    loading = true;
    loadingMore = false;
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    selectedCategoria: number | null = null;
    searchTerm = '';

    // Carrito
    carrito: { producto: Producto, cantidad: number }[] = [];
    mostrarCarrito = false;

    // Modal
    productoSeleccionado: Producto | null = null;
    mostrarModal = false;

    constructor(
        private productoService: ProductoService,
        private toastr: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        public authService: AuthService
    ) { }

    ngOnInit(): void {
        this.cargarCategorias();
        this.cargarProductosDestacados();
        this.cargarProductosOfertas();
        this.cargarProductos();
        this.cargarCarritoFromStorage();

        // Leer parámetros de URL
        this.route.queryParams.subscribe(params => {
            if (params['categoria']) {
                this.selectedCategoria = parseInt(params['categoria']);
                this.currentPage = 1;
                this.cargarProductos();
            }
            if (params['search']) {
                this.searchTerm = params['search'];
                this.currentPage = 1;
                this.cargarProductos();
            }
        });
    }

    cargarCategorias(): void {
        this.productoService.getCategorias().subscribe({
            next: (categorias) => {
                this.categorias = categorias.filter(cat => cat.activo === true);
            },
            error: (error) => console.error('Error al cargar categorías:', error)
        });
    }

    cargarProductosDestacados(): void {
        this.productoService.getProductosDestacados(8).subscribe({
            next: (productos) => {
                this.productosDestacados = productos.filter(p => p.activo === true);
            },
            error: (error) => console.error('Error al cargar destacados:', error)
        });
    }

    cargarProductosOfertas(): void {
        this.productoService.getProductosEnOferta(8).subscribe({
            next: (productos) => {
                this.productosOfertas = productos.filter(p => p.activo === true);
            },
            error: (error) => console.error('Error al cargar ofertas:', error)
        });
    }

    cargarProductos(reset: boolean = true): void {
        if (reset) {
            this.currentPage = 1;
            this.productos = [];
            this.loading = true;
        } else {
            this.loadingMore = true;
        }

        this.productoService.getProductosPublicos(
            this.currentPage,
            12,
            this.selectedCategoria,
            this.searchTerm
        ).subscribe({
            next: (response) => {
                const nuevosProductos = (response.results || []).filter(p => p.activo === true);

                if (reset) {
                    this.productos = nuevosProductos;
                } else {
                    this.productos = [...this.productos, ...nuevosProductos];
                }

                this.totalItems = response.count;
                this.totalPages = Math.ceil(response.count / 12);
                this.loading = false;
                this.loadingMore = false;

                // Productos recomendados (solo los primeros 4 activos)
                this.productosRecomendados = this.productos.filter(p => p.activo === true).slice(0, 4);
            },
            error: (error) => {
                console.error('Error al cargar productos:', error);
                this.loading = false;
                this.loadingMore = false;
            }
        });
    }

    cargarMas(): void {
        if (this.currentPage < this.totalPages && !this.loadingMore) {
            this.currentPage++;
            this.cargarProductos(false);
        }
    }

    filtrarPorCategoria(categoriaId: number | null): void {
        this.selectedCategoria = categoriaId;
        this.searchTerm = '';
        this.currentPage = 1;
        this.cargarProductos(true);

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { categoria: categoriaId || null, search: null },
            queryParamsHandling: 'merge'
        });
    }

    buscar(): void {
        if (this.searchTerm.trim()) {
            this.selectedCategoria = null;
            this.currentPage = 1;
            this.cargarProductos(true);

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { search: this.searchTerm, categoria: null },
                queryParamsHandling: 'merge'
            });
        }
    }

    limpiarBusqueda(): void {
        this.searchTerm = '';
        this.buscar();
    }

    verDetalleProducto(producto: Producto): void {
        this.productoSeleccionado = producto;
        this.mostrarModal = true;
        document.body.style.overflow = 'hidden';
    }

    cerrarModal(): void {
        this.mostrarModal = false;
        this.productoSeleccionado = null;
        document.body.style.overflow = 'auto';
    }

    // ========== CARRITO ==========
    cargarCarritoFromStorage(): void {
        const carritoGuardado = localStorage.getItem('carrito_shop');
        if (carritoGuardado) {
            this.carrito = JSON.parse(carritoGuardado);
        }
    }

    guardarCarrito(): void {
        localStorage.setItem('carrito_shop', JSON.stringify(this.carrito));
    }

    agregarAlCarrito(producto: Producto): void {
        if (!producto.tiene_stock) {
            this.toastr.warning('Producto sin stock', 'No disponible');
            return;
        }

        const itemExistente = this.carrito.find(item => item.producto.id === producto.id);

        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            this.carrito.push({ producto, cantidad: 1 });
        }

        this.guardarCarrito();
        this.toastr.success(`${producto.nombre} agregado al carrito`, 'Éxito');
        this.mostrarCarrito = true;
    }

    eliminarDelCarrito(productoId: number): void {
        this.carrito = this.carrito.filter(item => item.producto.id !== productoId);
        this.guardarCarrito();
    }

    actualizarCantidad(productoId: number, nuevaCantidad: number): void {
        const item = this.carrito.find(i => i.producto.id === productoId);
        if (item) {
            if (nuevaCantidad <= 0) {
                this.eliminarDelCarrito(productoId);
            } else if (nuevaCantidad <= item.producto.stock) {
                item.cantidad = nuevaCantidad;
                this.guardarCarrito();
            } else {
                this.toastr.warning(`Solo hay ${item.producto.stock} unidades disponibles`, 'Stock limitado');
            }
        }
    }

    get totalCarrito(): number {
        return this.carrito.reduce((total, item) => total + (item.producto.precio_actual * item.cantidad), 0);
    }

    get itemsCarrito(): number {
        return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    toggleCarrito(): void {
        this.mostrarCarrito = !this.mostrarCarrito;
    }

    getStars(rating: number): string[] {
        const fullStars = Math.floor(rating);
        const stars = [];
        for (let i = 0; i < fullStars; i++) stars.push('full');
        while (stars.length < 5) stars.push('empty');
        return stars;
    }

    onImgError(event: Event): void {
        const target = event.target as HTMLImageElement;
        if (target) {
            target.src = 'assets/images/placeholder.png';
        }
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(): void {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            this.cargarMas();
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscapePress(): void {
        if (this.mostrarModal) {
            this.cerrarModal();
        }
    }

    ngOnDestroy(): void {
        document.body.style.overflow = 'auto';
    }
}