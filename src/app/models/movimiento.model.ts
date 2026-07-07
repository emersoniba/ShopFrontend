// src/app/models/movimiento.model.ts
import { AuditoriaBase } from './base.model';
import { MovimientoDetalle } from './movimiento-detalle.model';

export interface Movimiento extends AuditoriaBase {
  tipo_movimiento: number;
  proveedor: number | null;
  almacen_origen: number | null;
  almacen_destino: number | null;
  comprobante: string | null;
  observacion: string | null;
  total_movimiento: number;
  // Campos adicionales
  detalles: MovimientoDetalle[];
  tipo_movimiento_nombre?: string;
  proveedor_nombre?: string;
}

// DTO para crear movimientos
export interface MovimientoDTO {
  tipo_movimiento: number;
  proveedor?: number | null;
  almacen_origen?: number | null;
  almacen_destino?: number | null;
  comprobante?: string | null;
  observacion?: string | null;
  detalles: MovimientoDetalleDTO[];
}

export interface MovimientoDetalleDTO {
  producto: number;
  cantidad: number;
  precio_unitario_compra?: number;
}