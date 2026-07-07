// src/app/models/stock-almacen.model.ts
import { AuditoriaBase } from './base.model';

export interface StockAlmacen extends AuditoriaBase {
  almacen: number;
  producto: number;
  cantidad: number;
  stock_minimo: number;
  // Campos adicionales
  almacen_nombre?: string;
  producto_nombre?: string;
  almacen_tipo_nombre?: string;
}