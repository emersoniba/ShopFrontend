// src/app/models/inventario/almacen.model.ts
import { AuditoriaBase } from '../base.model';

export interface Almacen extends AuditoriaBase {
  nombre: string;
  tipo_almacen: number; // ID
  activo: boolean;
  // Extraído del backend (read_only)
  tipo_almacen_nombre?: string;
}

export interface StockAlmacen extends AuditoriaBase {
  almacen: number;
  producto: number;
  cantidad: number; // En TypeScript, los Decimal de Django llegan como number o string (si superan el max safe integer). number está bien aquí.
  stock_minimo: number;
  // Extraídos del backend (read_only)
  producto_nombre?: string;
  almacen_nombre?: string;
}