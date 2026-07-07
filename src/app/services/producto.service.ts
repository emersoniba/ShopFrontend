// src/app/services/producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Producto, ProductoDTO } from '../models/producto.model';
import { PaginatedResponse } from '../models/paginated-response.model';


@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ========== PRODUCTOS CON PAGINACIÓN ==========
    getProductos(params?: {
        page?: number;
        page_size?: number;
        search?: string;
        categoria?: number;
        tipo_producto?: number;
        activo?: boolean;
        ordering?: string;
    }): Observable<PaginatedResponse<Producto>> {
        let httpParams = new HttpParams();
        
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }

        return this.http.get<PaginatedResponse<Producto>>(`${this.apiUrl}/productos/`, { 
            params: httpParams 
        });
    }

    getProducto(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/productos/${id}/`);
    }

    createProducto(data: FormData | ProductoDTO): Observable<Producto> {
        // Si es FormData, lo enviamos directamente (para imágenes)
        if (data instanceof FormData) {
            return this.http.post<Producto>(`${this.apiUrl}/productos/`, data);
        }
        // Si es JSON, lo enviamos como tal
        return this.http.post<Producto>(`${this.apiUrl}/productos/`, data);
    }

    updateProducto(id: number, data: FormData | ProductoDTO): Observable<Producto> {
        if (data instanceof FormData) {
            return this.http.put<Producto>(`${this.apiUrl}/productos/${id}/`, data);
        }
        return this.http.put<Producto>(`${this.apiUrl}/productos/${id}/`, data);
    }

    patchProducto(id: number, data: Partial<Producto>): Observable<Producto> {
        return this.http.patch<Producto>(`${this.apiUrl}/productos/${id}/`, data);
    }

    deleteProducto(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/productos/${id}/`);
    }

    toggleActivo(id: number, activo: boolean): Observable<Producto> {
        return this.http.patch<Producto>(`${this.apiUrl}/productos/${id}/`, { activo });
    }

    // ========== PRODUCTOS SIN PAGINACIÓN (para selects) ==========
    getAllProductos(activo?: boolean): Observable<Producto[]> {
        let params = new HttpParams();
        if (activo !== undefined) {
            params = params.set('activo', String(activo));
        }
        // Si necesitas todos sin paginación, puedes usar un parámetro especial
        params = params.set('all', 'true');
        return this.http.get<any>(`${this.apiUrl}/productos/`, { params }).pipe(
            map((response) => response.data || response.results || response)
        );
    }
}