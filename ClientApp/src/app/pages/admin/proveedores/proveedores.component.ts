import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProveedorService, Proveedor, ProveedorUpdateModel, ProveedorRegistroModel } from '../../../services/cliente/proveedor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registros-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class RegistrosProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  proveedorSeleccionado: Proveedor | null = null;

  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenamiento: string = 'recientes';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  isLoading: boolean = false;
  error: string | null = null;
  showAddModal: boolean = false;
  showEditModal: boolean = false;

  // Formulario reactivo para agregar
  addForm = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    contacto: new FormControl('', [
      Validators.maxLength(50)
    ]),
    telefono: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/),
      Validators.minLength(10),
      Validators.maxLength(10)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(100)
    ]),
    direccion: new FormControl('', [
      Validators.maxLength(200)
    ]),
    activo: new FormControl(true)
  });

  // Formulario reactivo para editar
  editForm = new FormGroup({
    proveedorId: new FormControl(0),
    nombre: new FormControl('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    contacto: new FormControl('', [
      Validators.maxLength(50)
    ]),
    telefono: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/),
      Validators.minLength(10),
      Validators.maxLength(10)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(100)
    ]),
    direccion: new FormControl('', [
      Validators.maxLength(200)
    ])
  });

  alertMessage: string = '';
  alertClass: string = '';
  alertIcon: string = '';

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit(): void {
    this.loadProveedores();
  }

  private handleError(error: any, operation: string): void {
    console.error(`❌ Error en ${operation}:`, error);
    let errorMessage = 'Error desconocido';

    if (error.status === 0) {
      errorMessage = `❌ No se puede conectar al servidor. Verifica que el servidor esté funcionando`;
    } else if (error.status === 500) {
      errorMessage = `❌ Error interno del servidor (500).`;
    } else if (error.status === 404) {
      errorMessage = `❌ Endpoint no encontrado (404).`;
    } else if (error.status === 401) {
      errorMessage = '❌ No autorizado (401).';
    } else if (error.status === 403) {
      errorMessage = '❌ Acceso denegado (403).';
    } else if (error.error?.message) {
      errorMessage = `❌ ${error.error.message}`;
    } else if (error.message) {
      errorMessage = `❌ ${error.message}`;
    }

    this.error = errorMessage;
    this.isLoading = false;
  }

  loadProveedores(): void {
    this.isLoading = true;
    this.error = null;

    this.proveedorService.getProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error, 'cargar proveedores');
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      this.proveedorService.searchProveedores(this.searchTerm).subscribe({
        next: (proveedores) => {
          this.proveedores = proveedores;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error, 'buscar proveedores');
        }
      });
    } else {
      this.loadProveedores();
    }
  }

  applyFilters(): void {
    let filtered = [...this.proveedores];

    if (this.filtroEstado !== 'todos') {
      const esActivo = this.filtroEstado === 'activos';
      filtered = filtered.filter(p => p.activo === esActivo);
    }

    switch (this.ordenamiento) {
      case 'recientes':
        filtered.sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
        break;
      case 'antiguos':
        filtered.sort((a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime());
        break;
      case 'nombre-az':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
    }

    this.proveedoresFiltrados = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  // Métodos para el modal de agregar
  openAddModal(): void {
    this.showAddModal = true;
    this.addForm.reset({
      activo: true
    });
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

 saveNewProveedor(): void {
  if (this.addForm.invalid) {
    this.markAllAsTouched(this.addForm);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor complete todos los campos requeridos correctamente',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  this.isLoading = true;
  const nuevoProveedor: ProveedorRegistroModel = {
    nombre: this.addForm.value.nombre || '',
    contacto: this.addForm.value.contacto || '',
    telefono: this.addForm.value.telefono || '',
    email: this.addForm.value.email || '',
    direccion: this.addForm.value.direccion || '',
    activo: this.addForm.value.activo || true
  };

  this.proveedorService.createProveedor(nuevoProveedor).subscribe({
    next: () => {
      this.showAddModal = false;
      this.loadProveedores();
      this.isLoading = false;
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Proveedor creado exitosamente',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true
      });
    },
    error: (error) => {
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.getErrorMessage(error, 'crear proveedor'),
        confirmButtonColor: '#3085d6'
      });
    }
  });
}

// Método auxiliar para obtener mensajes de error personalizados
private getErrorMessage(error: any, action: string): string {
  if (error.error && error.error.message) {
    return `Error al ${action}: ${error.error.message}`;
  }
  return `Ocurrió un error al ${action}. Por favor intente nuevamente.`;
}

editProveedor(proveedor: Proveedor): void {
  Swal.fire({
    title: 'Editar Proveedor',
    html: `¿Deseas editar los datos de <b>${proveedor.nombre}</b>?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, editar',
    cancelButtonText: 'Cancelar',
    backdrop: `
      rgba(0,0,0,0.7)
      url("/assets/images/edit-icon.png")
      left top
      no-repeat
    `
  }).then((result) => {
    if (result.isConfirmed) {
      this.proveedorSeleccionado = proveedor;
      this.editForm.patchValue({
        proveedorId: proveedor.proveedorId,
        nombre: proveedor.nombre,
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        direccion: proveedor.direccion || ''
      });
      this.showEditModal = true;

      // Feedback visual al abrir el modal
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Modo edición activado',
        showConfirmButton: false,
        timer: 1500
      });
    }
  });
}

 closeEditModal(): void {
  if (this.editForm.dirty) {
    Swal.fire({
      title: '¿Salir sin guardar?',
      text: 'Tienes cambios sin guardar. ¿Estás seguro de querer cerrar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showEditModal = false;
        this.editForm.reset();
      }
    });
  } else {
    this.showEditModal = false;
  }
}

saveProveedor(): void {
  if (this.editForm.invalid) {
    this.markAllAsTouched(this.editForm);
    Swal.fire({
      icon: 'error',
      title: 'Formulario incompleto',
      text: 'Por favor complete todos los campos requeridos',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  const formValue = this.editForm.value;
  if (!formValue.proveedorId) {
    Swal.fire('Error', 'No se pudo identificar el proveedor', 'error');
    return;
  }

  this.isLoading = true;
  const datosActualizacion: ProveedorUpdateModel = {
    proveedorId: formValue.proveedorId,
    nombre: formValue.nombre || '',
    contacto: formValue.contacto || '',
    telefono: formValue.telefono || '',
    email: formValue.email || '',
    direccion: formValue.direccion || ''
  };

  // Mostrar alerta de carga
  Swal.fire({
    title: 'Guardando cambios...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.proveedorService.updateProveedor(datosActualizacion.proveedorId, datosActualizacion).subscribe({
    next: () => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: '¡Proveedor actualizado!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        this.showEditModal = false;
        this.loadProveedores();
      });
      this.isLoading = false;
    },
    error: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.error?.message || 'Ocurrió un error al actualizar el proveedor',
        confirmButtonText: 'Entendido'
      });
      this.handleError(error, 'actualizar proveedor');
      this.isLoading = false;
    }
  });
}

  // Métodos auxiliares
  private markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  getError(controlName: string, formGroup: FormGroup): string {
    const control = formGroup.get(controlName);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) return 'Campo requerido';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['pattern']) return 'Solo números permitidos';
    if (control.errors['minlength'] || control.errors['maxlength']) {
      if (controlName === 'telefono') return 'Deben ser 10 dígitos';
      return `Máximo ${control.errors['maxlength']?.requiredLength || 'caracteres'} excedido`;
    }
    return '';
  }

  private showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertClass = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    this.alertIcon = type === 'success' ? '✅' : '❌';
    setTimeout(() => this.clearAlert(), 5000);
  }

  private clearAlert(): void {
    this.alertMessage = '';
    this.alertClass = '';
    this.alertIcon = '';
  }

  // Métodos de paginación
  get paginatedProveedores(): Proveedor[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.proveedoresFiltrados.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // Métodos para cambiar estado
 toggleEstado(proveedor: Proveedor): void {
  const accion = proveedor.activo ? 'desactivar' : 'activar';
  const estadoFuturo = proveedor.activo ? 'inactivo' : 'activo';
  const colorBoton = proveedor.activo ? '#d33' : '#28a745'; // Rojo para desactivar, verde para activar

  Swal.fire({
    title: `¿${accion.toUpperCase()} proveedor?`,
    html: `Estás a punto de <strong>${accion}</strong> a: <br><br>
           <b>${proveedor.nombre}</b><br>
           <small>ID: ${proveedor.proveedorId}</small>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: colorBoton,
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Sí, ${accion}`,
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      // Mostrar loader mientras se procesa
      Swal.fire({
        title: 'Procesando...',
        html: `Por favor espera mientras se ${accion} el proveedor`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.proveedorService.toggleActivo(proveedor.proveedorId).subscribe({
        next: () => {
          // Cerrar loader y mostrar confirmación
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: `¡Proveedor ${estadoFuturo.toUpperCase()}!`,
            showConfirmButton: false,
            timer: 1500
          });
          this.loadProveedores();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudo ${accion} el proveedor: ${error.message}`,
            confirmButtonText: 'Entendido'
          });
          this.handleError(error, `${accion} proveedor`);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  });
}


  clearError(): void {
    this.error = null;
  }

  retry(): void {
    this.clearError();
    this.loadProveedores();
  }

  formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toLocaleDateString('es-MX') : 'N/A';
  }
}
