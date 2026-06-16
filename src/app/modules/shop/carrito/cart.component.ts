// src/app/modules/shop/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Producto } from 'src/app/models/producto.models';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    carrito: { producto: Producto, cantidad: number }[] = [];
    
    constructor(
        private toastr: ToastrService,
        private router: Router
    ) {}
    
    ngOnInit(): void {
        this.cargarCarrito();
    }
    
    cargarCarrito(): void {
        const carritoGuardado = localStorage.getItem('carrito_shop');
        if (carritoGuardado) {
            this.carrito = JSON.parse(carritoGuardado);
        }
    }
    
    guardarCarrito(): void {
        localStorage.setItem('carrito_shop', JSON.stringify(this.carrito));
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
    
    eliminarDelCarrito(productoId: number): void {
        this.carrito = this.carrito.filter(item => item.producto.id !== productoId);
        this.guardarCarrito();
        this.toastr.success('Producto eliminado del carrito', 'Éxito');
    }
    
    vaciarCarrito(): void {
        if (this.carrito.length > 0) {
            this.carrito = [];
            this.guardarCarrito();
            this.toastr.success('Carrito vaciado correctamente', 'Éxito');
        }
    }
    
    get subtotal(): number {
        return this.carrito.reduce((total, item) => total + (item.producto.precio_actual * item.cantidad), 0);
    }
    
    get envio(): number {
        // Envío gratis si el subtotal es mayor a $50
        return this.subtotal >= 50 ? 0 : 5.99;
    }
    
    get total(): number {
        return this.subtotal + this.envio;
    }
    
    get itemsCarrito(): number {
        return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    }
    
    continuarComprando(): void {
        this.router.navigate(['/tienda']);
    }
    
    finalizarCompra(): void {
        if (this.carrito.length === 0) {
            this.toastr.warning('Tu carrito está vacío', 'No se puede continuar');
            return;
        }
        // Redirigir al checkout
        this.router.navigate(['/checkout']);
    }
    
    onImgError(event: Event): void {
        const target = event.target as HTMLImageElement;
        if (target) {
            target.src = 'assets/images/placeholder.png';
        }
    }
}