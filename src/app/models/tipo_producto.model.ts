// src/app/models/tipo-producto.model.ts
import { AuditoriaBase } from './base.model';

export interface TipoProducto extends AuditoriaBase {
    nombre: string;
    requiere_receta: boolean;
    activo: boolean;
}