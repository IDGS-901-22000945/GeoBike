import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../../services/cliente/cliente.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VentaService, Venta } from '../../../services/cliente/ventas.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class DashboardComponent implements OnInit {
  clientes: any[] = [];
  isLoading = false;
  error: string | null = null;

  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenamiento: string = 'recientes';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  ventas: Venta[] = [];
  totalVentas: number = 0;
  ventasRecientes: Venta[] = [];

  constructor(
    private clienteService: ClienteService,
    private ventaService: VentaService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
    this.loadVentas();
  }

  loadVentas(): void {
    this.ventaService.getVentas().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
        this.ventasRecientes = ventas
          .sort((a, b) => {
            const fechaB = b.fechaVenta ? new Date(b.fechaVenta).getTime() : 0;
            const fechaA = a.fechaVenta ? new Date(a.fechaVenta).getTime() : 0;
            return fechaB - fechaA;
          })
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Error cargando ventas:', error);
      }
    });
  }

  loadClientes(): void {
    this.isLoading = true;
    this.error = null;

    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.totalItems = this.clientes.length;  // Actualiza totalItems para paginación
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error, 'cargar clientes');
      }
    });
  }

  handleError(error: any, context: string): void {
    console.error(`Error al ${context}:`, error);
    this.error = `Error al ${context}: ${error.message || error.statusText || error}`;
    this.isLoading = false;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  clientesPaginados(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.clientes.slice(startIndex, endIndex);
  }
}
