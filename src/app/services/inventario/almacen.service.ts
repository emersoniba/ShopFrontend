// src/app/services/inventario/almacen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Almacen, StockAlmacen } from '../../models/inventario/almacen.model';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ========== ALMACENES ==========

  getAlmacenes(): Observable<Almacen[]> {
    return this.http.get<any>(`${this.apiUrl}/almacenes/`).pipe(
      map(res => res.data || res.results || res)
    );
  }

  createAlmacen(data: Partial<Almacen>): Observable<Almacen> {
    return this.http.post<any>(`${this.apiUrl}/almacenes/`, data).pipe(
      map(res => res.data || res)
    );
  }

  updateAlmacen(id: number, data: Partial<Almacen>): Observable<Almacen> {
    return this.http.put<any>(`${this.apiUrl}/almacenes/${id}/`, data).pipe(
      map(res => res.data || res)
    );
  }

  // ========== STOCK (Kardex físico) ==========

  // Permite filtrar el stock por almacén o por producto específico
  getStock(productoId?: number, almacenId?: number): Observable<StockAlmacen[]> {
    let params = new HttpParams();
    
    if (productoId) params = params.set('producto', String(productoId));
    if (almacenId) params = params.set('almacen', String(almacenId));

    return this.http.get<any>(`${this.apiUrl}/stock/`, { params }).pipe(
      map(res => res.data || res.results || res)
    );
  }
}