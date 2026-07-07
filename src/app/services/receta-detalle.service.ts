// src/app/services/receta-detalle.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RecetaDetalle } from '../models/receta-detalle.model';

@Injectable({
    providedIn: 'root'
})
export class RecetaDetalleService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getRecetasByProducto(productoPreparadoId: number): Observable<RecetaDetalle[]> {
        return this.http.get<any>(`${this.apiUrl}/recetas/?producto_preparado=${productoPreparadoId}`).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getRecetaDetalle(id: number): Observable<RecetaDetalle> {
        return this.http.get<RecetaDetalle>(`${this.apiUrl}/recetas/${id}/`);
    }

    createRecetaDetalle(data: Partial<RecetaDetalle>): Observable<RecetaDetalle> {
        return this.http.post<RecetaDetalle>(`${this.apiUrl}/recetas/`, data);
    }

    updateRecetaDetalle(id: number, data: Partial<RecetaDetalle>): Observable<RecetaDetalle> {
        return this.http.put<RecetaDetalle>(`${this.apiUrl}/recetas/${id}/`, data);
    }

    deleteRecetaDetalle(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/recetas/${id}/`);
    }

    deleteRecetasByProducto(productoPreparadoId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/recetas/?producto_preparado=${productoPreparadoId}`);
    }
}
