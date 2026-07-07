// src/app/models/movimientos/movimientos-catalogos.model.ts

import { AuditoriaBase } from '../base.model';

export interface Proveedor extends AuditoriaBase {
  razon_social: string;
  nit: string | null;
  telefono: string | null;
  contacto: string | null;
  activo: boolean;
}

export interface TipoMovimiento extends AuditoriaBase {
  nombre: string;
  factor_origen: number;
  factor_destino: number;
  requiere_origen: boolean;
  requiere_destino: boolean;
  requiere_proveedor: boolean;
  activo: boolean;
}

export interface EstadoMovimiento extends AuditoriaBase {
  nombre: string;
  permite_edicion: boolean;
  afecta_stock: boolean;
  activo: boolean;
}