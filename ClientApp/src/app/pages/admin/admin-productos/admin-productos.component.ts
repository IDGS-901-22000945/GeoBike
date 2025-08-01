import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto, ProductoService } from '../../../services/cliente/producto.service';
import { Proveedor, ProveedorService } from '../../../services/cliente/proveedor.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

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
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.addForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      proveedorId: [null],
      activo: [true],
      imagenBase64: [null]  // NUEVO campo para imagen
    });

    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      proveedorId: [null],
      activo: [true],
      imagenBase64: [null]  // NUEVO campo para imagen
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarProveedores();
  }

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    console.log('No file selected');
    return;
  }

  const file = input.files[0];
  console.log('Archivo seleccionado:', file);

  // Opcional: si quieres validar el tipo o tamaño, hazlo aquí
  // Por ejemplo, solo imágenes menores a 2MB
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('El archivo es demasiado grande (máx 2MB)');
    return;
  }

  // Lee el archivo como base64 (opcional, para mostrar preview o enviar a backend)
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    console.log('Archivo en base64:', base64);

    // Aquí puedes guardar el base64 en el formulario o en una variable para enviar después
    // Ejemplo, si tienes un formControl llamado 'imagenBase64':
    this.addForm.patchValue({ imagenBase64: base64 });
    // o si editForm, según corresponda
    // this.editForm.patchValue({ imagenBase64: base64 });
  };
  reader.readAsDataURL(file);
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

  // Manejar carga de archivo para addForm
  onFileSelectedAdd(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.addForm.patchValue({
          imagenBase64: reader.result?.toString() || null
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Manejar carga de archivo para editForm
  onFileSelectedEdit(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.editForm.patchValue({
          imagenBase64: reader.result?.toString() || null
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Filtros y búsqueda
  applyFilters(): void {
    let filtered = [...this.productos];

    if (this.filtroEstado === 'activos') {
      filtered = filtered.filter(p => p.activo);
    } else if (this.filtroEstado === 'inactivos') {
      filtered = filtered.filter(p => !p.activo);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
        (p.proveedor?.nombre && p.proveedor.nombre.toLowerCase().includes(term))
      );
    }

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
    this.currentPage = 1;
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
      activo: true,
      imagenBase64: null
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
      activo: producto.activo,
      imagenBase64: producto.imagenBase64 || null
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
        this.isLoading = false;

        Swal.fire({
          icon: 'success',
          title: 'Producto creado',
          text: 'El producto ha sido creado exitosamente.'
        });
      },
      error: (err) => {
        this.isLoading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error al crear producto',
          text: err.error?.message || 'Ocurrió un error inesperado.'
        });
      }
    });
  }

  saveProducto(): void {
    if (this.productoEditando) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas guardar los cambios?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          const productoActualizado: Producto = {
            ...this.productoEditando,
            ...this.editForm.value
          };

          this.productoService.updateProducto(productoActualizado).subscribe({
            next: () => {
              this.cargarProductos();
              Swal.fire({
                icon: 'success',
                title: 'Producto actualizado',
                text: 'El producto ha sido actualizado exitosamente',
                timer: 2000,
                showConfirmButton: false
              }).then(() => {
                this.closeEditModal();
                this.cdr.detectChanges();
              });
            },
            error: (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: String(error || 'Error desconocido'),
                confirmButtonText: 'Aceptar'
              }).then(() => {
                this.closeEditModal();
                this.cdr.detectChanges();
              });
            }
          });
        }
      });
    }
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
