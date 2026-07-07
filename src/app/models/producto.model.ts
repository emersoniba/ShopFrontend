// src/app/models/producto.model.ts
import { AuditoriaBase } from './base.model';
import { ProductoImagen } from './producto-imagen.model';
import { RecetaDetalle } from './receta-detalle.model';

export interface Producto extends AuditoriaBase {
  nombre: string;
  categoria: number;
  tipo_producto: number;
  unidad_medida: number;
  precio_venta: number;
  costo_promedio: number;
  capacidad: number;
  activo: boolean;
  imagen_principal: string | null;
  // Campos adicionales (readonly en el backend)
  imagenes?: ProductoImagen[];
  categoria_nombre?: string;
  unidad_abreviatura?: string;
  // Para la UI
  stock_total?: number;
  ingredientes?: RecetaDetalle[];
}

// DTO para crear/actualizar productos
export interface ProductoDTO {
  nombre: string;
  categoria: number;
  tipo_producto: number;
  unidad_medida: number;
  precio_venta: number;
  capacidad: number;
  activo?: boolean;
  imagen_principal?: File | string | null;
  imagenes?: File[] | ProductoImagen[];
}