// src/app/models/tipo-almacen.model.ts
import { AuditoriaBase } from './base.model';

export interface TipoAlmacen extends AuditoriaBase {
  nombre: string;
  activo: boolean;
}