// src/app/models/inventario/producto.model.ts
import { AuditoriaBase } from '../base.model';

// Este no hereda de AuditoriaBase porque en Django usamos models.Model estándar
export interface ProductoImagen {
  id?: number; // Opcional porque al crear no lo tienes
  producto: number;
  imagen: string; // URL que devuelve Django
  orden: number;
  activo: boolean;
}

export interface RecetaDetalle extends AuditoriaBase {
  producto_preparado: number;
  insumo: number;
  cantidad_necesaria: number;
  // Extraídos del backend (read_only)
  insumo_nombre?: string;
  unidad_medida?: string;
}

// Tu modelo corregido y adaptado al serializador
export interface Producto extends AuditoriaBase {
  nombre: string;
  categoria: number;
  tipo_producto: number;
  unidad_medida: number;
  precio_venta: number;
  costo_promedio: number;
  capacidad: number;
  activo: boolean;
  imagen_principal: string | null; // URL de la imagen

  // Campos anidados y de solo lectura que envía DRF
  categoria_nombre?: string;
  unidad_medida_abreviatura?: string; // Corregido: antes tenías unidad_abreviatura
  imagenes?: ProductoImagen[];

  // Opcionales para la UI (calculados en el front o por endpoints extra)
  stock_total?: number;
  ingredientes?: RecetaDetalle[];
}

// Tu DTO impecable para crear/editar (FormData compatible)
export interface ProductoDTO {
  nombre: string;
  categoria: number;
  tipo_producto: number;
  unidad_medida: number;
  precio_venta: number;
  capacidad: number;
  activo?: boolean;
  imagen_principal?: File | string | null;
  imagenes?: File[]; // Para enviar múltiples archivos al backend
}