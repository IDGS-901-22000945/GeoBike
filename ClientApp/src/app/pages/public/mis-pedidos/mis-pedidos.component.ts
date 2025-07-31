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
  fechaPedido: string; // o Date
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

  clienteId!: number; // <-- Aquí está la declaración que faltaba

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    if (usuario && usuario.clienteId) {
      this.clienteId = usuario.clienteId;
      this.cargarPedidos();
    } else {
      console.error('No se encontró clienteId en usuario logueado');
      // Aquí podrías redirigir al login o mostrar un mensaje
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
  }

  // Método para mostrar clases y colores de estado
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
