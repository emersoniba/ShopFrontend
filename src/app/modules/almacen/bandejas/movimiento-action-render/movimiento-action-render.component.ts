import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-movimiento-action-renderer',
  templateUrl: './movimiento-action-render.component.html',
  styleUrl: './movimiento-action-render.component.scss'
})
export class MovimientoActionRendererComponent implements ICellRendererAngularComp {
  public params: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onClick(action: string) {
    if (this.params.context && this.params.context.componentParent) {
      // Envía la acción ('view', 'edit', 'delete') al componente principal de Movimientos
      this.params.context.componentParent.OnActionClick({
        action: action,
        data: this.params.data
      });
    }
  }
}