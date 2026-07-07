// src/app/models/tipo-movimiento.model.ts
import { AuditoriaBase } from './base.model';

export interface TipoMovimiento extends AuditoriaBase {
  nombre: string;
  factor_origen: number; // -1, 0, 1
  factor_destino: number; // -1, 0, 1
  requiere_origen: boolean;
  requiere_destino: boolean;
  requiere_proveedor: boolean;
  activo: boolean;
}