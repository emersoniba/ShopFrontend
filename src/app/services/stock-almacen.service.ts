// src/app/services/stock-almacen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StockAlmacen } from '../models/stock-almacen.model';

@Injectable({
    providedIn: 'root'
})
export class StockAlmacenService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getStocks(params?: {
        almacen?: number;
        producto?: number;
        producto__nombre__icontains?: string;
        cantidad__lt?: number;
    }): Observable<StockAlmacen[]> {
        let httpParams = new HttpParams();
        
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }

        return this.http.get<any>(`${this.apiUrl}/stocks/`, { params: httpParams }).pipe(
            map((response) => response.data || response.results || response)
        );
    }

    getStock(id: number): Observable<StockAlmacen> {
        return this.http.get<StockAlmacen>(`${this.apiUrl}/stocks/${id}/`);
    }

    createStock(data: Partial<StockAlmacen>): Observable<StockAlmacen> {
        return this.http.post<StockAlmacen>(`${this.apiUrl}/stocks/`, data);
    }

    updateStock(id: number, data: Partial<StockAlmacen>): Observable<StockAlmacen> {
        return this.http.put<StockAlmacen>(`${this.apiUrl}/stocks/${id}/`, data);
    }

    patchStock(id: number, data: Partial<StockAlmacen>): Observable<StockAlmacen> {
        return this.http.patch<StockAlmacen>(`${this.apiUrl}/stocks/${id}/`, data);
    }

    deleteStock(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/stocks/${id}/`);
    }

    getStockByProducto(productoId: number): Observable<StockAlmacen[]> {
        return this.getStocks({ producto: productoId });
    }

    getStockByAlmacen(almacenId: number): Observable<StockAlmacen[]> {
        return this.getStocks({ almacen: almacenId });
    }
}