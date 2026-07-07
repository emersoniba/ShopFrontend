// src/app/services/movimientos/movimiento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Movimiento, MovimientoDTO } from '../../models/movimientos/movimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ========== CONSULTAS ==========

  getMovimientos(filtros?: any): Observable<Movimiento[]> {
    let params = new HttpParams();
    
    // Aquí puedes filtrar por estado, tipo, o fechas desde el frontend
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/movimientos/`, { params }).pipe(
      map(res => res.data || res.results || res)
    );
  }

  getMovimientoById(id: number): Observable<Movimiento> {
    return this.http.get<any>(`${this.apiUrl}/movimientos/${id}/`).pipe(
      map(res => res.data || res) // El backend ya incluye los detalles anidados por tu ViewSet
    );
  }

  // ========== TRANSACCIONES ==========

  /**
   * Crea un movimiento y sus detalles en una sola petición.
   * El backend procesará esto con transaction.atomic() y actualizará el stock.
   */
  createMovimiento(data: MovimientoDTO): Observable<Movimiento> {
    return this.http.post<any>(`${this.apiUrl}/movimientos/`, data).pipe(
      map(res => res.data || res)
    );
  }

  /**
   * Solo para actualizaciones de estado (Ej: Pasar de 'Borrador' a 'Completado')
   * o si necesitas anular un movimiento.
   */
  patchEstadoMovimiento(id: number, estadoId: number): Observable<Movimiento> {
    return this.http.patch<any>(`${this.apiUrl}/movimientos/${id}/`, { estado: estadoId }).pipe(
      map(res => res.data || res)
    );
  }
}