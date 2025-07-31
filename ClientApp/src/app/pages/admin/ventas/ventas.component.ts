import { VentaService, Venta, DetalleVenta } from './../../../services/cliente/ventas.service';
import { ServicioService, Servicio } from './../../../services/cliente/servicios.service';
import { Component, OnInit } from '@angular/core';
import { ProductoService, Producto } from '../../../services/cliente/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


interface ItemCarrito {
  id: number;
  nombre: string;
  descripcion?: string;
  precioMostrar: number;
  cantidad: number;
  subtotal: number;
  tipo: 'producto' | 'servicio';
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {

  tipoSeleccionado: 'productos' | 'servicios' = 'productos';
  searchTerm: string = '';
  items: (Producto | Servicio)[] = [];
  itemsFiltrados: (Producto | Servicio)[] = [];


  carrito: ItemCarrito[] = [];

  total: number = 0;
  montoRecibido: number = 0;
  cambio: number = 0;

alertMessage: string = '';
showAlert: boolean = false;

  constructor(
    private productoService: ProductoService,
    private servicioService: ServicioService,
    private ventaService: VentaService
  ) {}

  ngOnInit(): void {
    this.cargarItems();
  }
  getPrecio(item: Producto | Servicio): number {
  if ('precio' in item) return item.precio;
  if ('precioMensual' in item) return item.precioMensual ?? 0;
  return 0;
}

 cargarItems(): void {
  if (this.tipoSeleccionado === 'productos') {
    this.productoService.getProductos(true).subscribe(data => {
      this.items = data;
      this.filtrarItems();
    });
  } else {
    this.servicioService.getServicios().subscribe(data => {
      this.items = data.filter(s => s.activo);
      this.filtrarItems();
    });
  }
}

  filtrarItems(): void {
    const term = this.searchTerm.toLowerCase();
    this.itemsFiltrados = this.items.filter(item =>
      item.nombre.toLowerCase().includes(term)
    );
  }

agregarAlCarrito(item: Producto | Servicio): void {
  const tipo = this.tipoSeleccionado === 'productos' ? 'producto' : 'servicio';
  const id = (item as any).productoId || (item as any).servicioId;

  // Validar stock si es producto
  if (tipo === 'producto') {
const producto = this.items.find(p => (p as Producto).productoId === id) as Producto | undefined;
    if (!producto) {
      Swal.fire({
        icon: 'error',
        title: 'Producto no encontrado',
        toast: true,
        position: 'top-end',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    const existente = this.carrito.find(i => i.id === id && i.tipo === tipo);
    const cantidadActual = existente ? existente.cantidad : 0;

    if (cantidadActual + 1 > producto.stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        text: `Solo quedan ${producto.stock - cantidadActual} unidades disponibles.`,
        toast: true,
        position: 'top-end',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
  }

  // Agregar o actualizar carrito
  let existente = this.carrito.find(i => i.id === id && i.tipo === tipo);
  if (existente) {
    existente.cantidad++;
    existente.subtotal = existente.precioMostrar * existente.cantidad;
  } else {
    this.carrito.push({
      id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      precioMostrar: (item as Producto).precio || (item as Servicio).precioMensual || 0,
      cantidad: 1,
      subtotal: (item as Producto).precio || (item as Servicio).precioMensual || 0,
      tipo
    });
  }

  this.calcularTotal();

  Swal.fire({
    icon: 'success',
    title: 'Agregado al carrito',
    toast: true,
    position: 'top-end',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}


eliminarDelCarrito(item: ItemCarrito): void {
  this.carrito = this.carrito.filter(i => !(i.id === item.id && i.tipo === item.tipo));
  this.calcularTotal();

  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: `"${item.nombre}" eliminado del carrito`,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
}


  calcularTotal(): void {
    this.total = this.carrito.reduce((sum, i) => sum + i.subtotal, 0);
    this.calcularCambio();
  }

  calcularCambio(): void {
    this.cambio = this.montoRecibido - this.total;
  }

  procesarVenta(): void {
    if (this.cambio < 0 || this.carrito.length === 0) {
      alert('Monto recibido insuficiente o carrito vacío');
      return;
    }

    // Construir el objeto Venta para enviar al backend
    const venta: Venta = {
      total: this.total,
      tipoVenta: this.carrito[0].tipo, // asumir que solo se vende un tipo en la venta
      detallesVenta: this.carrito.map(i => ({
        productoId: i.tipo === 'producto' ? i.id : undefined,
        servicioId: i.tipo === 'servicio' ? i.id : undefined,
        cantidad: i.cantidad,
        precioUnitario: i.precioMostrar
      }))
    };

    this.ventaService.crearVenta(venta).subscribe({
      next: (res) => {
        alert('Venta procesada con éxito.');
        this.carrito = [];
        this.total = 0;
        this.montoRecibido = 0;
        this.cambio = 0;
        this.tipoSeleccionado = 'productos';
        this.searchTerm = '';
        this.cargarItems();
      },
      error: (err) => {
        alert('Error al procesar la venta.');
        console.error(err);
      }
    });


  }

}
