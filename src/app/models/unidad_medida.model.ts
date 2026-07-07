// src/app/models/unidad-medida.model.ts
import { AuditoriaBase } from './base.model';

export interface UnidadMedida extends AuditoriaBase {
  nombre: string;
  abreviatura: string;
  activo: boolean;
}
