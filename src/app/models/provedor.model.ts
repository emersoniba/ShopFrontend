// src/app/models/proveedor.model.ts
import { AuditoriaBase } from './base.model';

export interface Proveedor extends AuditoriaBase {
  razon_social: string;
  nit: string | null;
  telefono: string | null;
  contacto: string | null;
  activo: boolean;
}