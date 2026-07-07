import { AuditoriaBase } from "./base.model";

export interface RecetaDetalle extends AuditoriaBase {
  producto_preparado: number;
  insumo: number;
  cantidad_necesaria: number;
  // Campos adicionales para UI
  insumo_nombre?: string;
  insumo_unidad_abreviatura?: string;
  insumo_costo?: number;
}