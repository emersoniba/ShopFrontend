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

export interface Almacen {
    id: number;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
}

export interface StockAlmacen {
    id: number;
    almacen: number;
    almacen_nombre: string;
    cantidad: number;
    stock_minimo: number;
}

export interface Producto {
    id: number;
    nombre: string;
    slug: string;
    descripcion_corta: string;
    descripcion_larga?: string;
    precio: number;
    precio_oferta: number | null;
    precio_actual: number;
    stock_total: number;       // Calculado desde el backend
    stocks: StockAlmacen[];    // Desglose por almacenes/barras
    tiene_stock: boolean;
    imagen_principal_url: string | null;
    destacado: boolean;
    oferta: boolean;
    activo: boolean;
    categorias?: Categoria[];
    categoria_ids?: number[];
    categoria_nombres?: string[];
}

export interface TipoMovimiento {
    id: number;
    nombre: string;
    factor_origen: number;
    factor_destino: number;
    activo: boolean;
}

// Para la respuesta paginada del backend
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}