import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Producto, Categoria, PaginatedResponse, ProductoFilters } from '../models/producto.models';

@Injectable({
	providedIn: 'root'
})
export class ProductoService {
	private apiUrl = environment.apiUrl;

	constructor(private http: HttpClient) { }

	// ========== CATEGORÍAS ==========
	getCategorias(): Observable<Categoria[]> {
		return this.http.get<any>(`${this.apiUrl}/categorias/`).pipe(
			map((response) => {
				if (response.data) return response.data;
				if (response.results) return response.results;
				return response;
			})
		);
	}
	//productos admin
	getProductos(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Producto>> {
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
	// ========== PRODUCTOS PÚBLICOS ==========
	getProductosPublicos(page: number = 1, pageSize: number = 12, categoriaId?: number | null, search?: string): Observable<PaginatedResponse<Producto>> {
		let params = new HttpParams()
			.set('page', page.toString())
			.set('page_size', pageSize.toString());

		if (categoriaId && categoriaId > 0) {
			params = params.set('categoria', categoriaId.toString());
		}
		if (search && search.trim()) {
			params = params.set('search', search.trim());
		}

		return this.http.get<any>(`${this.apiUrl}/productos/publicos/`, { params }).pipe(
			map((response) => ({
				count: response.count,
				next: response.next,
				previous: response.previous,
				results: response.results || response.data || []
			}))
		);
	}

	getProductosDestacados(limit: number = 8): Observable<Producto[]> {
		return this.http.get<any>(`${this.apiUrl}/productos/destacados/`).pipe(
			map((response) => {
				const data = response.data || response;
				return (data.results || data).slice(0, limit);
			})
		);
	}

	getProductosEnOferta(limit: number = 8): Observable<Producto[]> {
		return this.http.get<any>(`${this.apiUrl}/productos/ofertas/`).pipe(
			map((response) => {
				const data = response.data || response;
				return (data.results || data).slice(0, limit);
			})
		);
	}

	getProductosByCategoria(categoriaId: number, page: number = 1, pageSize: number = 12): Observable<PaginatedResponse<Producto>> {
		return this.getProductosPublicos(page, pageSize, categoriaId);
	}

	buscarProductos(searchTerm: string, page: number = 1, pageSize: number = 12): Observable<PaginatedResponse<Producto>> {
		return this.getProductosPublicos(page, pageSize, null, searchTerm);
	}

	// ========== CRUD ADMIN ==========
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
	getProductoById(id: number): Observable<Producto> {
		return this.http.get<any>(`${this.apiUrl}/productos/${id}/`).pipe(map((response) => response.data || response));
	}

	/**
	 * Obtener un producto por slug
	 */
	getProductoBySlug(slug: string): Observable<Producto> {
		return this.http.get<any>(`${this.apiUrl}/productos/${slug}/`).pipe(map((response) => response.data || response));
	}
}