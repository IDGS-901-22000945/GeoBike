import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts'; // Importa el directivo del gráfico
import { ChartOptions } from 'chart.js';

// Servicios
import { ClienteService } from '../../../services/cliente/cliente.service';
import { PedidoService } from '../../../services/cliente/pedido.service';

// --- Interfaces para estructurar los datos ---
interface DetallePedido {
  nombre: string;
  tipo: string;
  cantidad: number;
}

interface Pedido {
  pedidoId: number;
  fechaPedido: string;
  estado: string;
  total: number;
  cliente?: { nombre: string };
  detalles: DetallePedido[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Agrega BaseChartDirective a los imports
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  // --- Propiedades para Datos ---
  clientes: any[] = [];
  totalVentas: number = 0;
  pedidosPendientes: number = 0;
  pedidosRecientes: Pedido[] = [];
  productoMasVendido: string = 'N/A';

  // **NUEVAS PROPIEDADES PARA EL GRÁFICO**
  public ventasPorFecha: { labels: string[], datasets: { data: number[], label: string }[] } = {
    labels: [],
    datasets: [
      { data: [], label: 'Ventas Diarias' }
    ]
  };

  // **NUEVO: Opciones de configuración para el gráfico**
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: '#6B7280' // Gray-500
        }
      },
      y: {
        ticks: {
          color: '#6B7280' // Gray-500
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#374151' // Gray-700
        }
      },
      tooltip: {
        backgroundColor: 'rgba(55, 65, 81, 0.8)', // Gray-700 with transparency
        titleColor: 'white',
        bodyColor: 'white'
      }
    }
  };

  // --- Propiedades para la UI ---
  isLoading = true;
  error: string | null = null;

  // --- Propiedades para Paginación de Clientes ---
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private http: HttpClient,
    private clienteService: ClienteService
    // Asegúrate de tener un PedidoService si lo necesitas
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    Promise.all([
      this.loadClientes(),
      this.loadPedidos()
    ]).then(() => {
      this.isLoading = false;
    }).catch(err => {
      this.handleError(err, 'cargar los datos del dashboard');
    });
  }

  // --- Métodos de Carga de Datos ---
  loadClientes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clienteService.getClientes().subscribe({
        next: (data) => { this.clientes = data; resolve(); },
        error: reject,
      });
    });
  }

  loadPedidos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Pedido[]>('https://localhost:7097/api/pedidos').subscribe({
        next: (data: Pedido[]) => {
          this.totalVentas = data.reduce((acc, pedido) => acc + pedido.total, 0);
          this.pedidosPendientes = data.filter(p => p.estado?.toLowerCase() === 'pendiente').length;
          this.pedidosRecientes = data
            .sort((a, b) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime())
            .slice(0, 5);

          // **NUEVO: Llamada para procesar los datos del gráfico**
          this.calcularVentasDiarias(data);

          this.calcularProductoMasVendido(data);
          resolve();
        },
        error: reject,
      });
    });
  }

  calcularVentasDiarias(pedidos: Pedido[]): void {
    const ventasDiarias: { [fecha: string]: number } = {};

    pedidos.forEach(pedido => {
      const fecha = new Date(pedido.fechaPedido).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      ventasDiarias[fecha] = (ventasDiarias[fecha] || 0) + pedido.total;
    });

    const labels = Object.keys(ventasDiarias).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
    });

    this.ventasPorFecha.labels = labels;
    this.ventasPorFecha.datasets[0].data = labels.map(fecha => ventasDiarias[fecha]);
  }

  calcularProductoMasVendido(pedidos: Pedido[]): void {
    const contadorProductos: { [nombre: string]: number } = {};

    pedidos.forEach(pedido => {
      if (pedido.detalles) {
        pedido.detalles.forEach(detalle => {
          if (detalle.tipo?.toLowerCase() === 'producto') {
            contadorProductos[detalle.nombre] = (contadorProductos[detalle.nombre] || 0) + detalle.cantidad;
          }
        });
      }
    });

    if (Object.keys(contadorProductos).length > 0) {
      this.productoMasVendido = Object.keys(contadorProductos).reduce((a, b) =>
        contadorProductos[a] > contadorProductos[b] ? a : b
      );
    } else {
      this.productoMasVendido = 'No hay ventas';
    }
  }

  handleError(error: any, context: string): void {
    console.error(`Error al ${context}:`, error);
    this.error = `No se pudo ${context}. Por favor, intente más tarde.`;
    this.isLoading = false;
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'entregado': return 'bg-green-100 text-green-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'preparando': return 'bg-yellow-100 text-yellow-800';
      case 'pendiente': return 'bg-orange-100 text-orange-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  get totalPages(): number {
    return Math.ceil(this.clientes.length / this.itemsPerPage);
  }

  clientesPaginados(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.clientes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

// Variables de paginación para pedidos
currentPagePedidos: number = 1;
pageSizePedidos: number = 5; // o la cantidad que prefieras mostrar por página

// Calcula el total de páginas para pedidos
get totalPagesPedidos(): number {
  return Math.ceil(this.pedidosRecientes.length / this.pageSizePedidos);
}

// Método para obtener sólo los pedidos de la página actual
pedidosPaginados(): any[] {
  const startIndex = (this.currentPagePedidos - 1) * this.pageSizePedidos;
  return this.pedidosRecientes.slice(startIndex, startIndex + this.pageSizePedidos);
}

// Avanzar página pedidos
nextPagePedidos() {
  if (this.currentPagePedidos < this.totalPagesPedidos) {
    this.currentPagePedidos++;
  }
}

// Retroceder página pedidos
previousPagePedidos() {
  if (this.currentPagePedidos > 1) {
    this.currentPagePedidos--;
  }
}


}
