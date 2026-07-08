// src/app/services/ventas/ventas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VentasService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getClientes(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/clientes/`).pipe(
            map(res => res.data || res.results || res)
        );
    }

    getMetodosPago(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/metodos-pago/`).pipe(
            map(res => res.data || res.results || res)
        );
    }

    registrarVenta(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/ventas/`, data).pipe(
            map(res => res.data || res)
        );
    }
}