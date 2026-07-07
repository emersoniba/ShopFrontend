// src/app/models/movimientos/movimiento-detalle.model.ts
import { AuditoriaBase } from '../base.model';

// Lo que recibes del backend cuando consultas un movimiento (GET)
export interface MovimientoDetalle extends AuditoriaBase {
  movimiento: number;
  producto: number;
  cantidad: number;
  precio_unitario_compra: number;
  subtotal: number; // El backend lo calcula y lo devuelve
  
  // Extraído del backend (read_only)
  producto_nombre?: string; 
}

// Lo que armas en el frontend para enviar al backend (POST)
export interface MovimientoDetalleDTO {
  producto: number;
  cantidad: number;
  precio_unitario_compra: number;
}