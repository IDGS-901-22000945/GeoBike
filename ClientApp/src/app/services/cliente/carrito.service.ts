import { Injectable } from '@angular/core';
import { Producto } from './producto.service';
import { Servicio } from './servicios.service';

export type TipoItem = 'producto' | 'servicio';

interface ProductoCarrito {
  productoId: number;
  cantidad: number;
  tipo: 'producto';
  id: number;
  precio: number;
  nombre: string;

}

interface ServicioCarrito {
  servicioId: number;
  cantidad: number;
  tipo: 'servicio';
  id: number;
  precioMensual: number;
  nombre: string;

}

export type ItemCarrito = ProductoCarrito | ServicioCarrito;

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items: ItemCarrito[] = [];

  constructor() {
    this.cargarDesdeLocalStorage();
  }

  private guardarEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }

  private cargarDesdeLocalStorage() {
    const datos = localStorage.getItem('carrito');
    if (datos) {
      this.items = JSON.parse(datos) as ItemCarrito[];
    }
  }

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
    this.items.push({
      productoId: producto.productoId,
      cantidad: 1,
      tipo: 'producto',
      id: producto.productoId,
      precio: producto.precio,
      nombre: producto.nombre  // <-- asigna nombre aquí
    });
  }

  this.guardarEnLocalStorage();
}

agregarServicio(servicio: Servicio) {
  const existente = this.items.find(
    s => s.tipo === 'servicio' && s.servicioId === servicio.servicioId
  ) as ServicioCarrito;

  if (existente) {
    existente.cantidad += 1;
  } else {
    this.items.push({
      servicioId: servicio.servicioId,
      cantidad: 1,
      tipo: 'servicio',
      id: servicio.servicioId,
      precioMensual: servicio.precioMensual,
      nombre: servicio.nombre  // <-- asigna nombre aquí
    });
  }

  this.guardarEnLocalStorage();
}


  eliminarItem(index: number) {
    this.items.splice(index, 1);
    this.guardarEnLocalStorage();
  }

  actualizarCantidad(index: number, cantidad: number) {
    if (cantidad > 0 && this.items[index]) {
      this.items[index].cantidad = cantidad;
      this.guardarEnLocalStorage();
    }
  }

  getSubtotal(): number {
    return this.items.reduce((sum, item) => {
      const precio =
        item.tipo === 'producto'
          ? item.precio
          : item.precioMensual;
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
    localStorage.removeItem('carrito');
  }
}
