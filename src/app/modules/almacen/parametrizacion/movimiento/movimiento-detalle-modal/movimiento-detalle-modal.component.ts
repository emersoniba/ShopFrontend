import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Movimiento } from 'src/app/models/movimientos/movimiento.model';

@Component({
    selector: 'app-movimiento-detalle-modal',
    templateUrl: './movimiento-detalle-modal.component.html'
})
export class MovimientoDetalleModalComponent {
    // Recibimos la fila completa (data) que incluye el array de 'detalles'
    constructor(@Inject(MAT_DIALOG_DATA) public data: Movimiento | any) {}
}