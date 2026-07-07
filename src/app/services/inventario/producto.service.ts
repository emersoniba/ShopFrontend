// src/app/services/inventario/producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Producto, ProductoDTO, ProductoImagen, RecetaDetalle } from '../../models/inventario/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // ========== PRODUCTOS (Sin paginación) ==========

  getProductos(filtros?: any): Observable<Producto[]> {
    let params = new HttpParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    
    return this.http.get<any>(`${this.apiUrl}/productos/`, { params }).pipe(
      // Mapea la respuesta por si el backend devuelve { data: [...] } o [...] directo
      map(res => res.data || res.results || res)
    );
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<any>(`${this.apiUrl}/productos/${id}/`).pipe(
      map(res => res.data || res)
    );
  }

  createProducto(data: FormData | ProductoDTO): Observable<Producto> {
    return this.http.post<any>(`${this.apiUrl}/productos/`, data).pipe(
      map(res => res.data || res) // Extrae el 'data' de tu SuccessResponse
    );
  }

  updateProducto(id: number, data: FormData | ProductoDTO): Observable<Producto> {
    return this.http.put<any>(`${this.apiUrl}/productos/${id}/`, data).pipe(
      map(res => res.data || res)
    );
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}/`);
  }

  toggleActivo(id: number, activo: boolean): Observable<Producto> {
    return this.http.patch<any>(`${this.apiUrl}/productos/${id}/`, { activo }).pipe(
      map(res => res.data || res)
    );
  }

  // ========== RECETAS (Ingredientes del producto) ==========
  
  // Puedes crear métodos similares si necesitas guardar detalles de receta
  createRecetaDetalle(data: any): Observable<RecetaDetalle> {
    return this.http.post<any>(`${this.apiUrl}/recetas-detalle/`, data).pipe(
      map(res => res.data || res)
    );
  }
}