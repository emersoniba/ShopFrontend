// src/app/models/categoria.model.ts
import { AuditoriaBase } from './base.model';

export interface Categoria extends AuditoriaBase {
  nombre: string;
  descripcion: string;
}