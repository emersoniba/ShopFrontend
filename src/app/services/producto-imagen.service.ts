// src/app/services/producto-imagen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductoImagen } from '../models/producto-imagen.model';

@Injectable({
    providedIn: 'root'
})
export class ProductoImagenService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getImagenesByProducto(productoId: number): Observable<ProductoImagen[]> {
        return this.http.get<any>(`${this.apiUrl}/producto-imagenes/?producto=${productoId}`).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    createImagen(data: FormData): Observable<ProductoImagen> {
        return this.http.post<ProductoImagen>(`${this.apiUrl}/producto-imagenes/`, data);
    }

    updateImagen(id: number, data: Partial<ProductoImagen>): Observable<ProductoImagen> {
        return this.http.put<ProductoImagen>(`${this.apiUrl}/producto-imagenes/${id}/`, data);
    }

    deleteImagen(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/producto-imagenes/${id}/`);
    }

    reordenarImagenes(imagenes: { id: number; orden: number }[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/producto-imagenes/reordenar/`, { imagenes });
    }
}