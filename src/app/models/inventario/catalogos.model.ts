// src/app/models//inventario/catalogos.model.ts
import { AuditoriaBase } from '../base.model';

export interface UnidadMedida extends AuditoriaBase {
  nombre: string;
  abreviatura: string;
  activo: boolean;
}

export interface TipoProducto extends AuditoriaBase {
  nombre: string;
  requiere_receta: boolean;
  activo: boolean;
}

export interface Categoria extends AuditoriaBase {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface TipoAlmacen extends AuditoriaBase {
  nombre: string;
  activo: boolean;
}