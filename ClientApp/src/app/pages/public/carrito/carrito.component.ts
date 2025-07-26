import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CarritoService,
  ItemCarrito
} from '../../../services/cliente/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  items: ItemCarrito[] = [];

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    this.items = this.carritoService.obtenerItems();
  }

  actualizarCantidad(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const nuevaCantidad = input.valueAsNumber;

    if (nuevaCantidad >= 1) {
      this.items[index].cantidad = nuevaCantidad;
      this.carritoService.actualizarCantidad(index, nuevaCantidad);
    }
  }

  eliminarItem(index: number) {
    this.carritoService.eliminarItem(index);
    this.items = this.carritoService.obtenerItems(); // Refrescar vista
  }

  obtenerPrecioUnitario(item: ItemCarrito): number {
    return item.tipo === 'producto'
      ? item.precio
      : item.precioMensual || 0;
  }

  get subtotal(): number {
    return this.carritoService.getSubtotal();
  }

  get envio(): number {
    return this.carritoService.getEnvio();
  }

  get total(): number {
    return this.carritoService.getTotal();
  }
}
