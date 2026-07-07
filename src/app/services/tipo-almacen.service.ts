// src/app/services/tipo-almacen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TipoAlmacen } from '../models/tipo-almacen.model';

@Injectable({
    providedIn: 'root'
})
export class TipoAlmacenService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getTiposAlmacen(activo?: boolean): Observable<TipoAlmacen[]> {
        let params = new HttpParams();
        if (activo !== undefined) {
            params = params.set('activo', String(activo));
        }
        return this.http.get<any>(`${this.apiUrl}/tipos-almacen/`, { params }).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getTipoAlmacen(id: number): Observable<TipoAlmacen> {
        return this.http.get<TipoAlmacen>(`${this.apiUrl}/tipos-almacen/${id}/`);
    }

    createTipoAlmacen(data: Partial<TipoAlmacen>): Observable<TipoAlmacen> {
        return this.http.post<TipoAlmacen>(`${this.apiUrl}/tipos-almacen/`, data);
    }

    updateTipoAlmacen(id: number, data: Partial<TipoAlmacen>): Observable<TipoAlmacen> {
        return this.http.put<TipoAlmacen>(`${this.apiUrl}/tipos-almacen/${id}/`, data);
    }

    deleteTipoAlmacen(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tipos-almacen/${id}/`);
    }
}