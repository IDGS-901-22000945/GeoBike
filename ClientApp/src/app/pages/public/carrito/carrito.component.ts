import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from './../../../autenticacion/auth.service';
import { CarritoService, ItemCarrito } from '../../../services/cliente/carrito.service';
import { PedidoService, CrearPedidoDto } from '../../../services/cliente/pedido.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  items: ItemCarrito[] = [];

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.items = this.carritoService.obtenerItems();
  }

  actualizarCantidad(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const nuevaCantidad = input.valueAsNumber;

    if (nuevaCantidad >= 1) {
      this.items[index].cantidad = nuevaCantidad;
      this.carritoService.actualizarCantidad(index, nuevaCantidad);
      this.items = this.carritoService.obtenerItems();
    }
  }

  eliminarItem(index: number) {
  this.carritoService.eliminarItem(index);
  this.items = this.carritoService.obtenerItems();

  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Ítem eliminado del carrito',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
}


  procederAlPago(): void {
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Inicia sesión para continuar con el pago.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    this.realizarPedido();
  }

  realizarPedido(): void {
    const usuario = this.authService.obtenerUsuario();

    if (!usuario) {
      Swal.fire('Error', 'No se encontró información del usuario.', 'error');
      return;
    }

    if (!usuario.clienteId) {
      Swal.fire('Error', 'No se encontró el cliente asociado al usuario.', 'error');
      return;
    }

    const pedidoDto: CrearPedidoDto = {
      clienteId: usuario.clienteId,
      items: this.items.map(item => ({
        tipo: item.tipo,
        itemId: item.id,
        cantidad: item.cantidad
      }))
    };

    console.log('Pedido DTO:', pedidoDto);

    this.pedidoService.crearPedido(pedidoDto).subscribe({
      next: (response) => {
        Swal.fire('Éxito', 'Pedido realizado correctamente', 'success');
        this.vaciarCarrito();
        this.router.navigate(['/carrito']);
      },
      error: (error) => {
        console.error('Error al realizar pedido:', error);
        Swal.fire('Error', 'Ocurrió un error al realizar el pedido', 'error');
      }
    });
  }

vaciarCarrito() {
  this.carritoService.vaciar();
  this.items = [];
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

  obtenerPrecioUnitario(item: ItemCarrito): number {
    return item.tipo === 'producto'
      ? item.precio || 0
      : item.precioMensual || 0;
  }
}
