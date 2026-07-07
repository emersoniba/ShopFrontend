// src/app/models/base.model.ts
export interface AuditoriaBase {
  id: number;
  creado_por: number | null;
  fecha_creacion: string; // ISO date string
  modificado_por: number | null;
  fecha_modificacion: string; // ISO date string
}