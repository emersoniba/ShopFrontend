// src/app/models/movimientos/movimiento.model.ts
import { AuditoriaBase } from '../base.model';
import { MovimientoDetalle, MovimientoDetalleDTO } from './movimiento-detalle.model';

// Lo que pinta tu tabla o vista de detalle en Angular (GET)
export interface Movimiento extends AuditoriaBase {
  tipo_movimiento: number;
  estado: number;
  proveedor: number | null;
  almacen_origen: number | null;
  almacen_destino: number | null;
  comprobante: string | null;
  observacion: string | null;
  total_movimiento: number;
  
  // Relación anidada: la lista de productos que entraron o salieron
  detalles: MovimientoDetalle[];
  
  // Campos de solo lectura (serializers en Django)
  tipo_movimiento_nombre?: string;
  estado_nombre?: string;
  proveedor_nombre?: string;
}

// El JSON exacto que enviarás al servidor para crear la transacción y actualizar stock (POST)
export interface MovimientoDTO {
  tipo_movimiento: number;
  estado: number;
  proveedor?: number | null;
  almacen_origen?: number | null;
  almacen_destino?: number | null;
  comprobante?: string | null;
  observacion?: string | null;
  total_movimiento?: number;
  
  // Aquí incrustas las filas que el usuario agregó en el carrito/formulario
  detalles: MovimientoDetalleDTO[]; 
}