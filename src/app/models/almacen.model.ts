// src/app/models/almacen.model.ts
import { AuditoriaBase } from './base.model';

export interface Almacen extends AuditoriaBase {
  nombre: string;
  tipo_almacen: number;
  activo: boolean;
  // Campo adicional
  tipo_almacen_nombre?: string;
}
