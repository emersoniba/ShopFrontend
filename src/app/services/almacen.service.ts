// src/app/services/almacen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Almacen } from '../models/almacen.model';

@Injectable({
    providedIn: 'root'
})
export class AlmacenService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAlmacenes(activo?: boolean, tipo?: number): Observable<Almacen[]> {
        let params = new HttpParams();
        if (activo !== undefined) {
            params = params.set('activo', String(activo));
        }
        if (tipo !== undefined) {
            params = params.set('tipo_almacen', String(tipo));
        }
        return this.http.get<any>(`${this.apiUrl}/almacenes/`, { params }).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getAlmacen(id: number): Observable<Almacen> {
        return this.http.get<Almacen>(`${this.apiUrl}/almacenes/${id}/`);
    }

    createAlmacen(data: Partial<Almacen>): Observable<Almacen> {
        return this.http.post<Almacen>(`${this.apiUrl}/almacenes/`, data);
    }

    updateAlmacen(id: number, data: Partial<Almacen>): Observable<Almacen> {
        return this.http.put<Almacen>(`${this.apiUrl}/almacenes/${id}/`, data);
    }

    deleteAlmacen(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/almacenes/${id}/`);
    }

    toggleActivo(id: number, activo: boolean): Observable<Almacen> {
        return this.http.patch<Almacen>(`${this.apiUrl}/almacenes/${id}/`, { activo });
    }
}