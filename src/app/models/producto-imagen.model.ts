// src/app/models/producto-imagen.model.ts
export interface ProductoImagen {
    id: number;
    producto: number;
    imagen: string; // URL de la imagen
    orden: number;
    activo: boolean;
}