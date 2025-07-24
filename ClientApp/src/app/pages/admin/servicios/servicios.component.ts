import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Servicio, ServicioService } from '../../../services/cliente/servicios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './servicios.component.html'
})
export class ServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
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
  servicioEditando: Servicio | null = null;

  // Formularios
  addForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private servicioService: ServicioService,
    private fb: FormBuilder
  ) {
    this.addForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precioMensual: [null],
      activo: [true]
    });

    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precioMensual: [null],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.isLoading = true;
    this.error = null;

    this.servicioService.getServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar servicios';
        this.isLoading = false;
      }
    });
  }

  // Filtros y búsqueda
  applyFilters(): void {
    let filtered = [...this.servicios];

    // Filtrar por estado
    if (this.filtroEstado === 'activos') {
      filtered = filtered.filter(s => s.activo);
    } else if (this.filtroEstado === 'inactivos') {
      filtered = filtered.filter(s => !s.activo);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
  const term = this.searchTerm.toLowerCase();
  filtered = filtered.filter(s =>
    s.nombre.toLowerCase().includes(term) ||
    (s.descripcion && s.descripcion.toLowerCase().includes(term))
  );
}
    // Ordenar
    switch (this.ordenamiento) {
      case 'recientes':
        filtered.sort((a, b) => (b.servicioId || 0) - (a.servicioId || 0));
        break;
      case 'antiguos':
        filtered.sort((a, b) => (a.servicioId || 0) - (b.servicioId || 0));
        break;
      case 'nombre-az':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'precio-mayor':
        filtered.sort((a, b) => (b.precioMensual || 0) - (a.precioMensual || 0));
        break;
    }

    this.totalItems = filtered.length;
    this.serviciosFiltrados = filtered;
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
      precioMensual: null,
      activo: true
    });
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(servicio: Servicio): void {
    this.servicioEditando = servicio;
    this.editForm.patchValue({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precioMensual: servicio.precioMensual,
      activo: servicio.activo
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.servicioEditando = null;
  }

  // CRUD Operations
  saveNewServicio(): void {
    if (this.addForm.invalid) return;

    this.isLoading = true;
    const newServicio = this.addForm.value;

    this.servicioService.createServicio(newServicio).subscribe({
      next: (servicio) => {
        this.servicios.unshift(servicio);
        this.applyFilters();
        this.showAddModal = false;
        this.showAlert('Servicio creado exitosamente', 'success');
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al crear servicio';
        this.isLoading = false;
      }
    });
  }

  saveServicio(): void {
    if (this.editForm.invalid || !this.servicioEditando) return;

    this.isLoading = true;
    const updatedServicio = { ...this.servicioEditando, ...this.editForm.value };

    this.servicioService.updateServicio(updatedServicio).subscribe({
      next: (servicio) => {
        const index = this.servicios.findIndex(s => s.servicioId === servicio.servicioId);
        if (index !== -1) {
          this.servicios[index] = servicio;
          this.applyFilters();
        }
        this.showEditModal = false;
        this.showAlert('Servicio actualizado exitosamente', 'success');
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al actualizar servicio';
        this.isLoading = false;
      }
    });
  }

  cambiarEstado(servicio: Servicio): void {
    if (servicio.servicioId === undefined) return;

    const newState = !servicio.activo;
    const action = newState ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro que deseas ${action} este servicio?`)) {
      this.servicioService.toggleActivo(servicio.servicioId).subscribe({
        next: () => {
          servicio.activo = newState;
          this.applyFilters();
          this.showAlert(`Servicio ${newState ? 'activado' : 'desactivado'} exitosamente`, 'success');
        },
        error: (err) => {
          this.error = err.message || `Error al ${action} servicio`;
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
