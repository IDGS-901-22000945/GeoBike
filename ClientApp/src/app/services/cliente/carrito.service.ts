import { Injectable } from '@angular/core';
import { Producto } from './producto.service';
import { Servicio } from './servicios.service'; // corregí nombre archivo

export type TipoItem = 'producto' | 'servicio';

export interface ProductoCarrito extends Producto {
  tipo: 'producto';
  cantidad: number;
}

export interface ServicioCarrito extends Servicio {
  tipo: 'servicio';
  cantidad: number;
}

export type ItemCarrito = ProductoCarrito | ServicioCarrito;

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items: ItemCarrito[] = [];

  obtenerItems(): ItemCarrito[] {
    return this.items;
  }

  agregarProducto(producto: Producto) {
    const existente = this.items.find(
      p => p.tipo === 'producto' && p.productoId === producto.productoId
    ) as ProductoCarrito;

    if (existente) {
      existente.cantidad += 1;
    } else {
      this.items.push({ ...producto, cantidad: 1, tipo: 'producto' });
    }
  }

  agregarServicio(servicio: Servicio) {
    const existente = this.items.find(
      s => s.tipo === 'servicio' && s.servicioId === servicio.servicioId
    ) as ServicioCarrito;

    if (existente) {
      existente.cantidad += 1;
    } else {
      this.items.push({ ...servicio, cantidad: 1, tipo: 'servicio' });
    }
  }

  eliminarItem(index: number) {
    this.items.splice(index, 1);
  }

  actualizarCantidad(index: number, cantidad: number) {
    if (cantidad > 0) {
      this.items[index].cantidad = cantidad;
    }
  }

  getSubtotal(): number {
    return this.items.reduce((sum, item) => {
      const precio = item.tipo === 'producto' ? item.precio : (item.precioMensual || 0);
      return sum + precio * item.cantidad;
    }, 0);
  }

  getEnvio(): number {
    return this.getSubtotal() > 0 ? 5.99 : 0;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getEnvio();
  }

  vaciar() {
    this.items = [];
  }
}
