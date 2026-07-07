// src/app/services/movimiento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Movimiento, MovimientoDTO } from '../models/movimiento.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class MovimientoService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ========== MOVIMIENTOS CON PAGINACIÓN ==========
    getMovimientos(params?: {
        page?: number;
        page_size?: number;
        tipo_movimiento?: number;
        proveedor?: number;
        almacen_origen?: number;
        almacen_destino?: number;
        fecha_desde?: string;
        fecha_hasta?: string;
        search?: string;
        ordering?: string;
    }): Observable<PaginatedResponse<Movimiento>> {
        let httpParams = new HttpParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }

        return this.http.get<PaginatedResponse<Movimiento>>(`${this.apiUrl}/movimientos/`, {
            params: httpParams
        });
    }

    getMovimiento(id: number): Observable<Movimiento> {
        return this.http.get<Movimiento>(`${this.apiUrl}/movimientos/${id}/`);
    }

    createMovimiento(data: MovimientoDTO): Observable<Movimiento> {
        return this.http.post<Movimiento>(`${this.apiUrl}/movimientos/`, data);
    }

    updateMovimiento(id: number, data: Partial<Movimiento>): Observable<Movimiento> {
        return this.http.put<Movimiento>(`${this.apiUrl}/movimientos/${id}/`, data);
    }

    patchMovimiento(id: number, data: Partial<Movimiento>): Observable<Movimiento> {
        return this.http.patch<Movimiento>(`${this.apiUrl}/movimientos/${id}/`, data);
    }

    deleteMovimiento(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/movimientos/${id}/`);
    }

    // ========== MOVIMIENTOS SIN PAGINACIÓN (para reports) ==========
    getAllMovimientos(params?: {
        tipo_movimiento?: number;
        fecha_desde?: string;
        fecha_hasta?: string;
    }): Observable<Movimiento[]> {
        let httpParams = new HttpParams();
        httpParams = httpParams.set('all', 'true');

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }

        return this.http.get<any>(`${this.apiUrl}/movimientos/`, { params: httpParams }).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    // ========== MÉTODOS ESPECIALES ==========
    getMovimientosByTipo(tipoMovimientoId: number): Observable<Movimiento[]> {
        return this.http.get<any>(`${this.apiUrl}/movimientos/?tipo_movimiento=${tipoMovimientoId}`).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getMovimientosByProveedor(proveedorId: number): Observable<Movimiento[]> {
        return this.http.get<any>(`${this.apiUrl}/movimientos/?proveedor=${proveedorId}`).pipe(
            map((response) => response.data || response.results || response)
        );
    }
}