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

	constructor(private http: HttpClient) {}

	// ========== CATEGORÍAS ==========

	/**
	 * Obtener todas las categorías
	 */
	getCategorias(): Observable<Categoria[]> {
		return this.http.get<any>(`${this.apiUrl}/categorias/`).pipe(
			map((response) => {
				if (response.data) return response.data;
				if (response.results) return response.results;
				return response;
			})
		);
	}

	/**
	 * Obtener una categoría por ID
	 */
	getCategoriaById(id: number): Observable<Categoria> {
		return this.http.get<any>(`${this.apiUrl}/categorias/${id}/`).pipe(map((response) => response.data || response));
	}

	/**
	 * Obtener una categoría por slug
	 */
	getCategoriaBySlug(slug: string): Observable<Categoria> {
		return this.http.get<any>(`${this.apiUrl}/categorias/?slug=${slug}`).pipe(
			map((response) => {
				const data = response.data || response;
				return data.results?.[0] || data[0];
			})
		);
	}

	// ========== PRODUCTOS ==========

	/**
	 * Obtener productos públicos (catálogo)
	 */
	getProductosPublicos(filters?: ProductoFilters): Observable<PaginatedResponse<Producto>> {
		let params = new HttpParams();

		if (filters) {
			if (filters.page) params = params.set('page', filters.page.toString());
			if (filters.page_size) params = params.set('page_size', filters.page_size.toString());
			if (filters.categoria) params = params.set('categoria', filters.categoria.toString());
			if (filters.categoria_slug) params = params.set('categoria_slug', filters.categoria_slug);
			if (filters.search) params = params.set('search', filters.search);
			if (filters.destacados) params = params.set('destacados', 'true');
			if (filters.ofertas) params = params.set('ofertas', 'true');
			if (filters.nuevos) params = params.set('nuevos', 'true');
			if (filters.orden) params = params.set('orden', filters.orden);
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

	/**
	 * Obtener todos los productos (con paginación)
	 */
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

	/**
	 * Obtener un producto por ID
	 */
	getProductoById(id: number): Observable<Producto> {
		return this.http.get<any>(`${this.apiUrl}/productos/${id}/`).pipe(map((response) => response.data || response));
	}

	/**
	 * Obtener un producto por slug
	 */
	getProductoBySlug(slug: string): Observable<Producto> {
		return this.http.get<any>(`${this.apiUrl}/productos/${slug}/`).pipe(map((response) => response.data || response));
	}

	/**
	 * Obtener productos destacados
	 */
	getProductosDestacados(limit: number = 8): Observable<Producto[]> {
		return this.http.get<any>(`${this.apiUrl}/productos/destacados/`).pipe(
			map((response) => {
				const data = response.data || response;
				return (data.results || data).slice(0, limit);
			})
		);
	}

	/**
	 * Obtener productos en oferta
	 */
	getProductosEnOferta(limit: number = 8): Observable<Producto[]> {
		return this.http.get<any>(`${this.apiUrl}/productos/ofertas/`).pipe(
			map((response) => {
				const data = response.data || response;
				return (data.results || data).slice(0, limit);
			})
		);
	}

	/**
	 * Obtener productos por categoría
	 */
	getProductosByCategoria(categoriaId: number, page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Producto>> {
		const params = new HttpParams()
			.set('categoria', categoriaId.toString())
			.set('page', page.toString())
			.set('page_size', pageSize.toString());

		return this.http.get<any>(`${this.apiUrl}/productos/publicos/`, { params }).pipe(
			map((response) => ({
				count: response.count,
				next: response.next,
				previous: response.previous,
				results: response.results || response.data || []
			}))
		);
	}

	/**
	 * Buscar productos por término
	 */
	buscarProductos(searchTerm: string, page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Producto>> {
		const params = new HttpParams().set('search', searchTerm).set('page', page.toString()).set('page_size', pageSize.toString());

		return this.http.get<any>(`${this.apiUrl}/productos/publicos/`, { params }).pipe(
			map((response) => ({
				count: response.count,
				next: response.next,
				previous: response.previous,
				results: response.results || response.data || []
			}))
		);
	}

	// ========== CRUD ADMIN (requiere autenticación) ==========

	// En producto.service.ts - actualizarProducto
	actualizarProducto(id: number, formData: FormData): Observable<Producto> {
		return this.http.patch<any>(`${this.apiUrl}/productos/${id}/`, formData).pipe(map((response) => response.data || response));
	}

	crearProducto(formData: FormData): Observable<Producto> {
		return this.http.post<any>(`${this.apiUrl}/productos/`, formData).pipe(map((response) => response.data || response));
	}
	/**
	 * Eliminar un producto (solo admin)
	 */
	eliminarProducto(id: number): Observable<any> {
		return this.http.delete<any>(`${this.apiUrl}/productos/${id}/`).pipe(map((response) => response.data || response));
	}

	/**
	 * Crear una categoría (solo admin)
	 */
	crearCategoria(data: Partial<Categoria>): Observable<Categoria> {
		return this.http.post<any>(`${this.apiUrl}/categorias/`, data).pipe(map((response) => response.data || response));
	}

	/**
	 * Actualizar una categoría (solo admin)
	 */
	actualizarCategoria(id: number, data: Partial<Categoria>): Observable<Categoria> {
		return this.http.put<any>(`${this.apiUrl}/categorias/${id}/`, data).pipe(map((response) => response.data || response));
	}

	/**
	 * Eliminar una categoría (solo admin)
	 */
	eliminarCategoria(id: number): Observable<any> {
		return this.http.delete<any>(`${this.apiUrl}/categorias/${id}/`).pipe(map((response) => response.data || response));
	}
}
