// src/app/services/movimientos/movimientos-catalogos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Proveedor, TipoMovimiento, EstadoMovimiento } from '../../models/movimientos/movimientos-catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class MovimientosCatalogosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ========== PROVEEDORES ==========
  getProveedores(activosOnly: boolean = true): Observable<Proveedor[]> {
    const params = activosOnly ? { activo: 'true' } : {};
    return this.http.get<any>(`${this.apiUrl}/proveedores/`, { params }).pipe(
      map(res => res.data || res.results || res)
    );
  }

  // ========== TIPOS DE MOVIMIENTO ==========
  getTiposMovimiento(activosOnly: boolean = true): Observable<TipoMovimiento[]> {
    const params = activosOnly ? { activo: 'true' } : {};
    return this.http.get<any>(`${this.apiUrl}/tipos-movimiento/`, { params }).pipe(
      map(res => res.data || res.results || res)
    );
  }

  // ========== ESTADOS DE MOVIMIENTO ==========
  getEstadosMovimiento(activosOnly: boolean = true): Observable<EstadoMovimiento[]> {
    const params = activosOnly ? { activo: 'true' } : {};
    return this.http.get<any>(`${this.apiUrl}/estados-movimiento/`, { params }).pipe(
      map(res => res.data || res.results || res)
    );
  }
}