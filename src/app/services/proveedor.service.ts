// src/app/services/proveedor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Proveedor } from '../models/provedor.model';
//import { Proveedor } from '../models/proveedor.model';

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getProveedores(activo?: boolean): Observable<Proveedor[]> {
        let params = new HttpParams();
        if (activo !== undefined) {
            params = params.set('activo', String(activo));
        }
        return this.http.get<any>(`${this.apiUrl}/proveedores/`, { params }).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getProveedor(id: number): Observable<Proveedor> {
        return this.http.get<Proveedor>(`${this.apiUrl}/proveedores/${id}/`);
    }

    createProveedor(data: Partial<Proveedor>): Observable<Proveedor> {
        return this.http.post<Proveedor>(`${this.apiUrl}/proveedores/`, data);
    }

    updateProveedor(id: number, data: Partial<Proveedor>): Observable<Proveedor> {
        return this.http.put<Proveedor>(`${this.apiUrl}/proveedores/${id}/`, data);
    }

    deleteProveedor(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/proveedores/${id}/`);
    }

    toggleActivo(id: number, activo: boolean): Observable<Proveedor> {
        return this.http.patch<Proveedor>(`${this.apiUrl}/proveedores/${id}/`, { activo });
    }
}