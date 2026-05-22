import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
	selector: 'app-ver-mas-renderer',
	templateUrl: './text-expand-renderer.component.html',
	styleUrls: ['./text-expand-renderer.component.css']
})
export class VerMasRendererComponent implements ICellRendererAngularComp {
	params: any;
	textoOriginal: string = '';
	expandido: boolean = false;
	mostrarBoton: boolean = false;

	agInit(params: any): void {
		this.params = params;
		this.textoOriginal = params.value || '';
		const palabras = this.textoOriginal.trim().split(/\s+/);
		this.mostrarBoton = palabras.length > 5;
	}

	toggleVerMas(): void {
		this.expandido = !this.expandido;
	}

	mostrarTexto(): string {
		const palabras = this.textoOriginal.trim().split(/\s+/);
		if (this.expandido || palabras.length <= 5) {
			return this.textoOriginal;
		}
		return palabras.slice(0, 5).join(' ') + '...';
	}

	refresh(): boolean {
		return false;
	}
}
