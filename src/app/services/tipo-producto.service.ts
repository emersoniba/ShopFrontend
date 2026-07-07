// src/app/services/tipo-producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TipoProducto } from '../models/tipo_producto.model';

@Injectable({
    providedIn: 'root'
})
export class TipoProductoService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getTiposProducto(activo?: boolean): Observable<TipoProducto[]> {
        let params = new HttpParams();
        if (activo !== undefined) {
            params = params.set('activo', String(activo));
        }
        return this.http.get<any>(`${this.apiUrl}/tipos-producto/`, { params }).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getTipoProducto(id: number): Observable<TipoProducto> {
        return this.http.get<TipoProducto>(`${this.apiUrl}/tipos-producto/${id}/`);
    }

    createTipoProducto(data: Partial<TipoProducto>): Observable<TipoProducto> {
        return this.http.post<TipoProducto>(`${this.apiUrl}/tipos-producto/`, data);
    }

    updateTipoProducto(id: number, data: Partial<TipoProducto>): Observable<TipoProducto> {
        return this.http.put<TipoProducto>(`${this.apiUrl}/tipos-producto/${id}/`, data);
    }

    deleteTipoProducto(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tipos-producto/${id}/`);
    }
}