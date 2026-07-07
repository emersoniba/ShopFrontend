// src/app/services/inventario/catalogos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Categoria, TipoProducto, UnidadMedida, TipoAlmacen } from '../../models/inventario/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Todas estas peticiones omiten paginación y devuelven arreglos directos

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<any>(`${this.apiUrl}/categorias/`).pipe(
      map(res => res.data || res.results || res)
    );
  }

  getTiposProducto(): Observable<TipoProducto[]> {
    return this.http.get<any>(`${this.apiUrl}/tipos-producto/`).pipe(
      map(res => res.data || res.results || res)
    );
  }

  getUnidadesMedida(): Observable<UnidadMedida[]> {
    return this.http.get<any>(`${this.apiUrl}/unidades-medida/`).pipe(
      map(res => res.data || res.results || res)
    );
  }

  getTiposAlmacen(): Observable<TipoAlmacen[]> {
    return this.http.get<any>(`${this.apiUrl}/tipos-almacen/`).pipe(
      map(res => res.data || res.results || res)
    );
  }
}