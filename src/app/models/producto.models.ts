// src/app/models/producto.models.ts
export interface Categoria {
    id: number;
    nombre: string;
    slug: string;
    descripcion: string;
    imagen: string | null;
    orden: number;
    activo: boolean;
}

export interface Producto {
    id: number;
    nombre: string;
    slug: string;
    descripcion_corta: string;
    descripcion_larga: string;
    precio: number;
    precio_oferta: number | null;
    precio_actual: number;
    descuento_porcentaje: number;
    stock: number;
    stock_minimo: number;
    imagen_principal_url: string | null;
    imagenes_adicionales: string[];
    destacado: boolean;
    oferta: boolean;
    nuevo: boolean;
    mas_vendido: boolean;
    calificacion_promedio: number;
    total_resenas: number;
    tiene_stock: boolean;
    activo: boolean;
    categorias: Categoria[];
    categoria_ids?: number[];
    fecha_creacion: string;
    fecha_modificacion: string;
}

// Para la respuesta paginada
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Filtros para productos
export interface ProductoFilters {
    page?: number;
    page_size?: number;
    categoria?: number;
    categoria_slug?: string;
    search?: string;
    destacados?: boolean;
    ofertas?: boolean;
    nuevos?: boolean;
    orden?: string;
}