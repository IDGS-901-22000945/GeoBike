import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto, ProductoService } from '../../../services/cliente/producto.service';
import { Proveedor, ProveedorService } from '../../../services/cliente/proveedor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-productos.component.html'
})
export class AdminProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  proveedores: Proveedor[] = [];
  isLoading = true;
  error: string | null = null;
  alertMessage: string | null = null;
  alertClass: string = '';
  alertIcon: string = '';

  // Filtros y búsqueda
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenamiento: string = 'recientes';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Modales
  showAddModal = false;
  showEditModal = false;
  productoEditando: Producto | null = null;

  // Formularios
  addForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private productoService: ProductoService,
    private proveedorService: ProveedorService,
    private fb: FormBuilder
  ) {
    this.addForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      proveedorId: [null],
      activo: [true]
    });

    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      proveedorId: [null],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarProveedores();
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.error = null;

    this.productoService.getProductos(true).subscribe({
      next: (data) => {
        this.productos = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar productos';
        this.isLoading = false;
      }
    });
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
      }
    });
  }

  // Filtros y búsqueda
  applyFilters(): void {
    let filtered = [...this.productos];

    // Filtrar por estado
    if (this.filtroEstado === 'activos') {
      filtered = filtered.filter(p => p.activo);
    } else if (this.filtroEstado === 'inactivos') {
      filtered = filtered.filter(p => !p.activo);
    }

    // Filtrar por término de búsqueda
   if (this.searchTerm) {
  const term = this.searchTerm.toLowerCase();
  filtered = filtered.filter(p =>
    p.nombre.toLowerCase().includes(term) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
    (p.proveedor?.nombre && p.proveedor.nombre.toLowerCase().includes(term))
  );
}
    // Ordenar
    switch (this.ordenamiento) {
      case 'recientes':
        filtered.sort((a, b) => (b.productoId || 0) - (a.productoId || 0));
        break;
      case 'antiguos':
        filtered.sort((a, b) => (a.productoId || 0) - (b.productoId || 0));
        break;
      case 'nombre-az':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'precio-mayor':
        filtered.sort((a, b) => b.precio - a.precio);
        break;
    }

    this.totalItems = filtered.length;
    this.productosFiltrados = filtered;
    this.currentPage = 1; // Resetear a la primera página
  }

  onSearch(): void {
    this.applyFilters();
  }

  // Paginación
  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
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

  // Modales
  openAddModal(): void {
    this.addForm.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      proveedorId: null,
      activo: true
    });
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(producto: Producto): void {
    this.productoEditando = producto;
    this.editForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      proveedorId: producto.proveedorId,
      activo: producto.activo
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.productoEditando = null;
  }

  // CRUD Operations
  saveNewProducto(): void {
    if (this.addForm.invalid) return;

    this.isLoading = true;
    const newProducto = this.addForm.value;

    this.productoService.createProducto(newProducto).subscribe({
      next: (producto) => {
        this.productos.unshift(producto);
        this.applyFilters();
        this.showAddModal = false;
        this.showAlert('Producto creado exitosamente', 'success');
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al crear producto';
        this.isLoading = false;
      }
    });
  }

  saveProducto(): void {
    if (this.editForm.invalid || !this.productoEditando) return;

    this.isLoading = true;
    const updatedProducto = { ...this.productoEditando, ...this.editForm.value };

    this.productoService.updateProducto(updatedProducto).subscribe({
      next: (producto) => {
        const index = this.productos.findIndex(p => p.productoId === producto.productoId);
        if (index !== -1) {
          this.productos[index] = producto;
          this.applyFilters();
        }
        this.showEditModal = false;
        this.showAlert('Producto actualizado exitosamente', 'success');
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al actualizar producto';
        this.isLoading = false;
      }
    });
  }

  cambiarEstado(producto: Producto): void {
    if (producto.productoId === undefined) return;

    const newState = !producto.activo;
    const action = newState ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro que deseas ${action} este producto?`)) {
      this.productoService.toggleActivo(producto.productoId).subscribe({
        next: () => {
          producto.activo = newState;
          this.applyFilters();
          this.showAlert(`Producto ${newState ? 'activado' : 'desactivado'} exitosamente`, 'success');
        },
        error: (err) => {
          this.error = err.message || `Error al ${action} producto`;
        }
      });
    }
  }

  // Helpers
  showAlert(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;
    this.alertClass = type === 'success' ? 'bg-green-100 text-green-800' :
                     type === 'error' ? 'bg-red-100 text-red-800' :
                     'bg-blue-100 text-blue-800';
    this.alertIcon = type === 'success' ? '✓' :
                    type === 'error' ? '✗' :
                    'i';

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }

  clearError(): void {
    this.error = null;
  }
}
