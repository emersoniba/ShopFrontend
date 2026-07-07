// src/app/models/movimiento-detalle.model.ts
import { AuditoriaBase } from './base.model';

export interface MovimientoDetalle extends AuditoriaBase {
  movimiento: number;
  producto: number;
  cantidad: number;
  precio_unitario_compra: number;
  subtotal: number;
  // Campos adicionales
  producto_nombre?: string;
}
