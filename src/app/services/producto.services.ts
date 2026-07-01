import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Producto, Categoria, PaginatedResponse, Almacen, StockAlmacen, TipoMovimiento } from '../models/producto.models';

@Injectable({
	providedIn: 'root'
})
export class ProductoService {
	private apiUrl = environment.apiUrl;

	constructor(private http: HttpClient) { }

	// ========== CATEGORÍAS ==========
	getCategorias(): Observable<Categoria[]> {
		return this.http.get<any>(`${this.apiUrl}/categorias/`).pipe(
			map((response) => response.data || response.results || response)
		);
	}

	// ========== PRODUCTOS ADMIN ==========
	getProductos(page: number = 1, pageSize: number = 100): Observable<PaginatedResponse<Producto>> {
		// El backend soporta paginación. Pedimos 100 para que AG Grid lo pagine localmente.
		const params = new HttpParams().set('page', page.toString()).set('page_size', pageSize.toString());

		return this.http.get<any>(`${this.apiUrl}/productos/`, { params }).pipe(
			map((response) => ({
				count: response.count,
				next: response.next,
				previous: response.previous,
				results: response.results || response.data || []
			}))
		);
	}

	// ========== ALMACENES E INVENTARIO ==========
	getAlmacenes(): Observable<Almacen[]> {
		return this.http.get<any>(`${this.apiUrl}/almacenes/`).pipe(
			map((response) => response.data || response.results || response)
		);
	}

	getTiposMovimiento(): Observable<TipoMovimiento[]> {
		return this.http.get<any>(`${this.apiUrl}/tipos-movimiento/`).pipe(
			map((response) => response.data || response.results || response)
		);
	}

	// ========== CRUD ADMIN PRODUCTOS ==========
	crearProducto(formData: FormData): Observable<Producto> {
		return this.http.post<any>(`${this.apiUrl}/productos/`, formData).pipe(
			map((response) => response.data || response)
		);
	}

	actualizarProducto(id: number, formData: FormData): Observable<Producto> {
		return this.http.patch<any>(`${this.apiUrl}/productos/${id}/`, formData).pipe(
			map((response) => response.data || response)
		);
	}

	eliminarProducto(id: number): Observable<any> {
		return this.http.delete<any>(`${this.apiUrl}/productos/${id}/`).pipe(
			map((response) => response.data || response)
		);
	}
}