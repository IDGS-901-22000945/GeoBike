import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto, ProductoService } from '../../../services/cliente/producto.service';
import { Servicio, ServicioService } from '../../../services/cliente/servicios.service';
import { CarritoService } from '../../../services/cliente/carrito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  servicios: Servicio[] = [];

  constructor(
    private productoService: ProductoService,
    private servicioService: ServicioService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarServicios();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: data => this.productos = data.filter(p => p.activo),
      error: err => console.error('Error cargando productos', err)
    });
  }

  cargarServicios() {
    this.servicioService.getServicios().subscribe({
      next: data => this.servicios = data.filter(s => s.activo),
      error: err => console.error('Error cargando servicios', err)
    });
  }

  getServicioIcon(servicio: any): string {
  // Puedes basarte en nombre o en algún campo tipo para asignar iconos distintos
  if (!servicio) return 'fas fa-cogs'; // ícono default

  const nombre = servicio.nombre.toLowerCase();

  if (nombre.includes('mantenimiento')) return 'fas fa-tools';
  if (nombre.includes('soporte')) return 'fas fa-headset';
  if (nombre.includes('consultoría')) return 'fas fa-briefcase';
  if (nombre.includes('entrenamiento')) return 'fas fa-chalkboard-teacher';

  return 'fas fa-cogs'; // default
}


 agregarAlCarrito(producto: Producto) {
  this.carritoService.agregarProducto(producto);
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: `"${producto.nombre}" agregado al carrito`,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
}

agregarServicioAlCarrito(servicio: Servicio) {
  this.carritoService.agregarServicio(servicio);
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: `"${servicio.nombre}" agregado al carrito`,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
}


}
