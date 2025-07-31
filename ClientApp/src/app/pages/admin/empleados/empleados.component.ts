import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PersonalService, Personal, EmpleadoRegistroModel, EmpleadoUpdateModel } from '../../../services/cliente/empleados.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-registros-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit {
  empleados: Personal[] = [];
  empleadosFiltrados: Personal[] = [];
  empleadoSeleccionado: Personal | null = null;

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

  addForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    apellidoPaterno: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    apellidoMaterno: new FormControl('', [Validators.maxLength(100)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(100)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]),
    puesto: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    fechaContratacion: new FormControl(null),
    activo: new FormControl(true)
  });

  editForm = new FormGroup({
    personalId: new FormControl<number | null>(0),
    usuarioId: new FormControl<number | null>(0),
    nombre: new FormControl<string | null>('', [Validators.required, Validators.maxLength(100)]),
    apellidoPaterno: new FormControl<string | null>('', [Validators.required, Validators.maxLength(100)]),
    apellidoMaterno: new FormControl<string | null>('', [Validators.maxLength(100)]),
    email: new FormControl<string | null>('', [Validators.required, Validators.email, Validators.maxLength(100)]),
    puesto: new FormControl<string | null>('', [Validators.required, Validators.maxLength(100)]),
    fechaContratacion: new FormControl<string | null>(null),
    activo: new FormControl<boolean>(true)
  });

  alertMessage: string = '';
  alertClass: string = '';
  alertIcon: string = '';

  constructor(private empleadoService: PersonalService) {}

  ngOnInit(): void {
    this.loadEmpleados();
  }

  private handleError(error: any, operation: string): void {
    console.error(`❌ Error en ${operation}:`, error);
    let errorMessage = 'Error desconocido';

    if (error.status === 0) {
      errorMessage = `❌ No se puede conectar al servidor. Verifica que el backend esté corriendo.`;
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

  loadEmpleados(): void {
    this.isLoading = true;
    this.error = null;

    console.log('🔄 Cargando empleados...');
    this.empleadoService.getPersonal().subscribe({
      next: (empleados) => {
        console.log('✅ Empleados cargados:', empleados.length);

        // ✅ Adaptar estructura para cumplir con la interfaz Personal
        this.empleados = empleados.map(emp => ({
          ...emp,
          usuario: {
            usuarioId: emp.usuarioId,
            email: emp.email || '',
            rol: emp.rol || 'empleado',
            fechaCreacion: emp.fechaContratacion || '', // Puedes ajustar si viene otro nombre
            activo: emp.activo // este viene del backend plano
          }
        }));

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error, 'cargar empleados');
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      console.log('🔍 Buscando empleados:', this.searchTerm);
      this.empleadoService.searchPersonal(this.searchTerm).subscribe({
        next: (empleados) => {
          this.empleados = empleados;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error, 'buscar empleados');
        }
      });
    } else {
      this.loadEmpleados();
    }
  }

  applyFilters(): void {
    let filtered = [...this.empleados];

    if (this.filtroEstado !== 'todos') {
      const esActivo = this.filtroEstado === 'activos';
      filtered = filtered.filter(p => p.usuario?.activo === esActivo);
    }

    switch (this.ordenamiento) {
      case 'recientes':
        filtered.sort((a, b) => new Date(b.fechaContratacion ?? 0).getTime() - new Date(a.fechaContratacion ?? 0).getTime());
        break;
      case 'antiguos':
        filtered.sort((a, b) => new Date(a.fechaContratacion ?? 0).getTime() - new Date(b.fechaContratacion ?? 0).getTime());
        break;
      case 'nombre-az':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
    }

    this.empleadosFiltrados = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.addForm.reset({ activo: true });
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveNewEmpleado(): void {
  if (this.addForm.invalid) {
    this.markAllAsTouched(this.addForm);
    Swal.fire({
      icon: 'warning',
      title: 'Formulario incompleto',
      text: 'Por favor completa todos los campos requeridos.',
    });
    return;
  }

  this.isLoading = true;

  const nuevoEmpleado: EmpleadoRegistroModel = {
    email: this.addForm.value.email || '',
    password: this.addForm.value.password || '',
    nombre: this.addForm.value.nombre || '',
    apellidoPaterno: this.addForm.value.apellidoPaterno || '',
    apellidoMaterno: this.addForm.value.apellidoMaterno || '',
    puesto: this.addForm.value.puesto || '',
    fechaContratacion: this.addForm.value.fechaContratacion || undefined
  };

  this.empleadoService.registerEmpleado(nuevoEmpleado).subscribe({
    next: () => {
      this.showAddModal = false;
      this.loadEmpleados();
      Swal.fire({
        icon: 'success',
        title: '¡Empleado creado!',
        text: 'El empleado fue registrado exitosamente.'
      });
      this.isLoading = false;
    },
    error: (error: any) => {
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error al crear empleado',
        text: 'Ocurrió un problema al registrar el empleado. Intenta de nuevo.'
      });
      this.handleError(error, 'crear empleado');
    }
  });
}


editEmpleado(empleado: Personal): void {
  this.empleadoSeleccionado = empleado;
  this.editForm.patchValue({
    personalId: empleado.personalId ?? 0,
    usuarioId: empleado.usuarioId ?? 0,
    nombre: empleado.nombre,
    apellidoPaterno: empleado.apellidoPaterno,
    apellidoMaterno: empleado.apellidoMaterno || '',
    puesto: empleado.puesto,
    fechaContratacion: empleado.fechaContratacion ?? null,
    email: empleado.usuario?.email || '',
    activo: empleado.usuario?.activo ?? true
  });
  this.showEditModal = true;

  Swal.fire({
    icon: 'info',
    title: 'Editar empleado',
    text: `Editando al empleado: ${empleado.nombre} ${empleado.apellidoPaterno}`,
    timer: 2000,
    showConfirmButton: false
  });
}

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveEmpleado(): void {
  if (this.editForm.invalid) {
    this.markAllAsTouched(this.editForm);
    Swal.fire({
      icon: 'warning',
      title: 'Formulario inválido',
      text: 'Por favor completa todos los campos obligatorios.'
    });
    return;
  }

  const formValue = this.editForm.value;
  if (!formValue.personalId || formValue.personalId === 0) return;

  if (!formValue.email?.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Email obligatorio',
      text: 'El email es un campo requerido.'
    });
    this.isLoading = false;
    return;
  }

  this.isLoading = true;

  const datosActualizacion: EmpleadoUpdateModel = {
    personalId: formValue.personalId,
    email: formValue.email || '',
    nombre: formValue.nombre || '',
    apellidoPaterno: formValue.apellidoPaterno || '',
    apellidoMaterno: formValue.apellidoMaterno || '',
    puesto: formValue.puesto || '',
    fechaContratacion: formValue.fechaContratacion || undefined
  };

  this.empleadoService.updatePersonal(formValue.personalId, datosActualizacion).subscribe({
    next: () => {
      this.showEditModal = false;
      this.loadEmpleados();
      Swal.fire({
        icon: 'success',
        title: 'Empleado actualizado',
        text: 'Los datos del empleado fueron actualizados correctamente.'
      });
      this.isLoading = false;
    },
    error: (error) => {
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: 'No se pudo actualizar el empleado. Intenta de nuevo.'
      });
      this.handleError(error, 'actualizar empleado');
    }
  });
}


 toggleEstado(empleado: Personal): void {
  if (empleado.personalId === undefined) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Empleado sin ID, no se puede cambiar estado'
    });
    return;
  }

  const accion = empleado.usuario?.activo ? 'desactivar' : 'activar';

  Swal.fire({
    title: `¿Está seguro de que desea ${accion} a ${empleado.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Sí, ${accion}`,
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      this.isLoading = true;
      console.log(`🔄 Cambiando estado de empleado ${empleado.personalId} a ${accion}`);

      this.empleadoService.toggleEstadoEmpleado(empleado.personalId).subscribe({
        next: (response) => {
          console.log('✅ Estado cambiado exitosamente:', response);

          if (empleado.usuario) {
            empleado.usuario.activo = response.nuevoEstado;
          }

          Swal.fire({
            icon: 'success',
            title: `Estado cambiado exitosamente`
          });

          this.loadEmpleados();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: `Error al ${accion} empleado`,
            text: 'No se pudo completar la acción. Intenta de nuevo.'
          });
          this.handleError(error, `${accion} empleado`);
        }
      });
    }
  });
}

  markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(c => c.markAsTouched());
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

  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertClass = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    this.alertIcon = type === 'success' ? '✅' : '❌';
    setTimeout(() => this.clearAlert(), 5000);
  }

  clearAlert(): void {
    this.alertMessage = '';
    this.alertClass = '';
    this.alertIcon = '';
  }

  clearError(): void {
    this.error = null;
  }

  retry(): void {
    this.clearError();
    this.loadEmpleados();
  }

  formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toLocaleDateString('es-MX') : 'N/A';
  }

  getEstado(empleado: Personal): string {
    return empleado.usuario?.activo ? 'Activo' : 'Inactivo';
  }

  get paginatedEmpleados(): Personal[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.empleadosFiltrados.slice(start, start + this.itemsPerPage);
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

  getInitials(nombre: string, apellidoPaterno: string): string {
    const inicialNombre = nombre ? nombre.charAt(0).toUpperCase() : '';
    const inicialApellido = apellidoPaterno ? apellidoPaterno.charAt(0).toUpperCase() : '';
    return inicialNombre + inicialApellido;
  }

  getAvatarColor(nombre: string): string {
    return 'bg-blue-200 text-blue-800';
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
