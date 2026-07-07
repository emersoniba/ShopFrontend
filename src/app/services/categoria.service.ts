// src/app/services/categoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Categoria } from '../models/categoria.model';

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getCategorias(): Observable<Categoria[]> {
        return this.http.get<any>(`${this.apiUrl}/categorias/`).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getCategoria(id: number): Observable<Categoria> {
        return this.http.get<Categoria>(`${this.apiUrl}/categorias/${id}/`);
    }

    createCategoria(data: Partial<Categoria>): Observable<Categoria> {
        return this.http.post<Categoria>(`${this.apiUrl}/categorias/`, data);
    }

    updateCategoria(id: number, data: Partial<Categoria>): Observable<Categoria> {
        return this.http.put<Categoria>(`${this.apiUrl}/categorias/${id}/`, data);
    }

    deleteCategoria(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/categorias/${id}/`);
    }
}