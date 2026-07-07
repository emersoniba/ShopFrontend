// src/app/services/unidad-medida.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UnidadMedida } from '../models/unidad_medida.model';
//import { UnidadMedida } from '../models/unidad-medida.model';

@Injectable({
    providedIn: 'root'
})
export class UnidadMedidaService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getUnidadesMedida(activo?: boolean): Observable<UnidadMedida[]> {
        let params = new HttpParams();
        if (activo !== undefined) {
            params = params.set('activo', String(activo));
        }
        return this.http.get<any>(`${this.apiUrl}/unidades-medida/`, { params }).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getUnidadMedida(id: number): Observable<UnidadMedida> {
        return this.http.get<UnidadMedida>(`${this.apiUrl}/unidades-medida/${id}/`);
    }

    createUnidadMedida(data: Partial<UnidadMedida>): Observable<UnidadMedida> {
        return this.http.post<UnidadMedida>(`${this.apiUrl}/unidades-medida/`, data);
    }

    updateUnidadMedida(id: number, data: Partial<UnidadMedida>): Observable<UnidadMedida> {
        return this.http.put<UnidadMedida>(`${this.apiUrl}/unidades-medida/${id}/`, data);
    }

    deleteUnidadMedida(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/unidades-medida/${id}/`);
    }

    toggleActivo(id: number, activo: boolean): Observable<UnidadMedida> {
        return this.http.patch<UnidadMedida>(`${this.apiUrl}/unidades-medida/${id}/`, { activo });
    }
}