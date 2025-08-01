import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
}

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  templateUrl: './mis-pedidos.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class MisPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;
  mostrarModal: boolean = false;

  clienteId!: number;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    if (usuario && usuario.clienteId) {
      this.clienteId = usuario.clienteId;
      this.cargarPedidos();
    } else {
      console.error('No se encontró clienteId en usuario logueado');
    }
  }

  cargarPedidos() {
    this.http.get<Pedido[]>(`https://localhost:7097/api/pedidos/cliente/${this.clienteId}`).subscribe({
      next: (data) => this.pedidos = data,
      error: (err) => console.error('Error cargando pedidos', err)
    });
  }

  verDetalles(pedido: Pedido) {
    this.pedidoSeleccionado = pedido;
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pedidoSeleccionado = null;
    document.body.style.overflow = 'auto';
  }

  getEstadoColor(estado: string) {
    switch (estado.toLowerCase()) {
      case 'completado': return 'bg-green-500';
      case 'procesando': return 'bg-yellow-500';
      case 'pendiente': return 'bg-blue-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
}
