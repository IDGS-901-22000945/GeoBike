import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../services/cliente/pedido.service';
import Swal from 'sweetalert2';

interface DetallePedido {
  nombre: string;
  tipo: string;
  cantidad: number;
  precioUnitario: number;
}

interface Pedido {
  pedidoId: number;
  fechaPedido: string;
  estado: string;
  total: number;
  detalles: DetallePedido[];
  cliente: { nombre: string };
}

@Component({
  selector: 'app-pedidos-cliente',
  standalone: true,
  templateUrl: './pedidos-cliente.component.html',
  imports: [CommonModule, FormsModule],
})
export class PedidosClienteComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;
  mostrarModal: boolean = false;

  estadosDisponibles = ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'];

  // Variables para paginación
  paginaActual: number = 1;
  pedidosPorPagina: number = 10;

  constructor(private http: HttpClient, private PedidoService: PedidoService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    console.log('Cargando pedidos desde API admin...');
    this.http.get<Pedido[]>(`https://localhost:7097/api/pedidos`).subscribe({
      next: (data) => {
        console.log('Pedidos recibidos:', data);
        this.pedidos = data;
        this.paginaActual = 1;
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);
      }
    });
  }

  // Getter para obtener los pedidos visibles en la página actual
  get pedidosPaginados(): Pedido[] {
    const inicio = (this.paginaActual - 1) * this.pedidosPorPagina;
    return this.pedidos.slice(inicio, inicio + this.pedidosPorPagina);
  }

  // Calcular total de páginas
  totalPaginas(): number {
    return Math.ceil(this.pedidos.length / this.pedidosPorPagina);
  }

  // Cambiar página con validación
  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas()) return;
    this.paginaActual = nuevaPagina;
  }

  verDetalles(pedido: Pedido) {
    this.pedidoSeleccionado = { ...pedido };
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pedidoSeleccionado = null;
    document.body.style.overflow = 'auto';
  }

  guardarEstado() {
    if (!this.pedidoSeleccionado) return;

    this.PedidoService.actualizarEstado(this.pedidoSeleccionado.pedidoId, this.pedidoSeleccionado.estado)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Estado actualizado correctamente',
            timer: 2000,
            showConfirmButton: false,
          });
          this.cargarPedidos();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al actualizar estado', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al actualizar estado',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  getEstadoColor(estado: string) {
    switch (estado.toLowerCase()) {
      case 'entregado': return 'bg-green-500';
      case 'preparando': return 'bg-yellow-500';
      case 'pendiente': return 'bg-blue-500';
      case 'cancelado': return 'bg-red-500';
      case 'enviado': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  }
}
