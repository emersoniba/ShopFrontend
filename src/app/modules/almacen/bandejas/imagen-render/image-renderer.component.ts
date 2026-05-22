import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-image-renderer',
    template: `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
            <img 
                [src]="imageUrl" 
                width="50" 
                height="50" 
                style="object-fit: cover; border-radius: 5px; cursor: pointer;" 
                (error)="onImageError()"
                (click)="onImageClick()"
                [title]="title"
            />
        </div>
    `
})
export class ImageRendererComponent implements ICellRendererAngularComp {
    public imageUrl: string = 'assets/images/producto.png';
    public title: string = '';
    private params: any;

    agInit(params: any): void {
        this.params = params;
        const imagenUrl = params.value;
        
        this.title = imagenUrl && imagenUrl !== 'null' && imagenUrl.trim() !== '' 
            ? 'Click para ver imagen completa' 
            : 'Sin imagen';
        
        this.imageUrl = imagenUrl && imagenUrl !== 'null' && imagenUrl.trim() !== '' 
            ? imagenUrl 
            : 'assets/images/producto.png';
    }

    refresh(params: any): boolean {
        this.params = params;
        const imagenUrl = params.value;
        
        this.title = imagenUrl && imagenUrl !== 'null' && imagenUrl.trim() !== '' 
            ? 'Click para ver imagen completa' 
            : 'Sin imagen';
        
        this.imageUrl = imagenUrl && imagenUrl !== 'null' && imagenUrl.trim() !== '' 
            ? imagenUrl 
            : 'assets/images/producto.png';
        
        return true;
    }

    onImageError(): void {
        this.imageUrl = 'assets/images/producto.png';
        this.title = 'Error al cargar la imagen';
    }

    onImageClick(): void {
        if (this.imageUrl !== 'assets/images/producto.png' && this.imageUrl) {
            // Abrir imagen en nueva pestaña
            window.open(this.imageUrl, '_blank');
        }
    }
}