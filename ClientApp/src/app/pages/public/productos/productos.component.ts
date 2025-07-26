import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto, ProductoService } from '../../../services/cliente/producto.service';
import { Servicio, ServicioService } from '../../../services/cliente/servicios.service'; 
import { CarritoService } from '../../../services/cliente/carrito.service';

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

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto);
    alert(`"${producto.nombre}" agregado al carrito`);
  }

  agregarServicioAlCarrito(servicio: Servicio) {
    this.carritoService.agregarServicio(servicio);
    alert(`"${servicio.nombre}" agregado al carrito`);
  }

}
