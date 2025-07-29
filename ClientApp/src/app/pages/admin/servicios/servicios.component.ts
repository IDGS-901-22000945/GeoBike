import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Servicio, ServicioService } from '../../../services/cliente/servicios.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


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
  // Resetear el formulario
  this.editForm.reset();

  // Cerrar el modal
  this.showEditModal = false;

  // Limpiar el servicio en edición
  this.servicioEditando = null;

  // Forzar detección de cambios si es necesario
}

  // CRUD Operations
 // Helpers (manteniendo tu estructura pero con SweetAlert)
showAlert(message: string, type: 'success' | 'error' | 'info'): void {
  Swal.fire({
    title: message,
    icon: type,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: type === 'success' ? '#f0fdf4' :
               type === 'error' ? '#fef2f2' :
               '#eff6ff',
    color: type === 'success' ? '#166534' :
          type === 'error' ? '#b91c1c' :
          '#1e40af'
  });
}

// CRUD Operations (estructura original con SweetAlert)
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
      this.showAlert(err.message || 'Error al crear servicio', 'error');
      this.isLoading = false;
    }
  });
}

saveServicio(): void {
  if (this.editForm.invalid || !this.servicioEditando) {
    this.showAlert('Formulario inválido', 'error');
    return;
  }

  this.isLoading = true;
  const updatedServicio = { ...this.servicioEditando, ...this.editForm.value };

  this.servicioService.updateServicio(updatedServicio).subscribe({
    next: (servicio) => {
      const index = this.servicios.findIndex(s => s.servicioId === servicio.servicioId);
      if (index !== -1) {
        this.servicios[index] = servicio;
        this.applyFilters();
      }
      this.showAlert('Servicio actualizado exitosamente', 'success');
      this.closeEditModal(); // Asegurar que se cierre el modal
      this.isLoading = false;
    },
    error: (err) => {
      this.showAlert(err.message || 'Error al actualizar servicio', 'error');
      this.isLoading = false;
      // No cerramos el modal en error para permitir correcciones
    },
    complete: () => {
      this.isLoading = false; // Asegurar que loading se desactive siempre
    }
  });
}

async cambiarEstado(servicio: Servicio): Promise<void> {
  if (servicio.servicioId === undefined) return;

  const newState = !servicio.activo;
  const action = newState ? 'activar' : 'desactivar';

  const result = await Swal.fire({
    title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} servicio?`,
    text: `¿Estás seguro que deseas ${action} este servicio?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: `Sí, ${action}`,
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    this.servicioService.toggleActivo(servicio.servicioId).subscribe({
      next: () => {
        servicio.activo = newState;
        this.applyFilters();
        this.showAlert(`Servicio ${newState ? 'activado' : 'desactivado'} exitosamente`, 'success');
      },
      error: (err) => {
        this.showAlert(err.message || `Error al ${action} servicio`, 'error');
      }
    });
  }
}

  clearError(): void {
    this.error = null;
  }
}
