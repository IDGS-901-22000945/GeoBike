import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProveedorService, Proveedor, ProveedorUpdateModel, ProveedorRegistroModel } from '../../../services/cliente/proveedor.service';
import { PersonalService, Personal } from '../../../services/cliente/empleados.service';
import { Usuario } from '../../../services/cliente/usuario.service';

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
  empleadosSeleccionado: Personal | null = null;

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
    nombre: new FormControl('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    apellidoPaterno: new FormControl('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    apellidoMaterno: new FormControl('', [
      Validators.maxLength(100)
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
    password: new FormControl('', [   // <-- Aquí el password
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(100)
    ]),
    puesto: new FormControl('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    fechaContratacion: new FormControl(null),
    activo: new FormControl(true)
  });


  editForm = new FormGroup({
    personalId: new FormControl<number | null>(0),
    usuarioId: new FormControl<number | null>(0),
    nombre: new FormControl<string | null>('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    apellidoPaterno: new FormControl<string | null>('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    apellidoMaterno: new FormControl<string | null>('', [
      Validators.maxLength(100)
    ]),
    telefono: new FormControl<string | null>('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/),
      Validators.minLength(10),
      Validators.maxLength(10)
    ]),
    email: new FormControl<string | null>('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(100)
    ]),
    puesto: new FormControl<string | null>('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    fechaContratacion: new FormControl<string | null>(null), // <- aquí el cambio
    activo: new FormControl<boolean | null>(true)
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

  loadEmpleados(): void {
    this.isLoading = true;
    this.error = null;

    this.empleadoService.getPersonal().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
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

  saveNewEmpleado(): void {
    if (this.addForm.invalid) {
      this.markAllAsTouched(this.addForm);
      return;
    }

    this.isLoading = true;

    const nuevoEmpleado: Personal = {
      nombre: this.addForm.value.nombre || '',
      apellidoPaterno: this.addForm.value.apellidoPaterno || '',
      apellidoMaterno: this.addForm.value.apellidoMaterno || '', // si lo tienes en el form
      puesto: this.addForm.value.puesto || '',
      fechaContratacion: this.addForm.value.fechaContratacion || undefined,

      usuario: {
        email: this.addForm.value.email || '',
        passwordHash: this.addForm.value.password || '',  // asegúrate que el form tenga este control
        rol: 'empleado',  // TS lo infiere bien
        activo: this.addForm.value.activo ?? true,
        fechaCreacion: new Date().toISOString() // o que lo maneje backend
      }
    };

    this.empleadoService.createPersonal(nuevoEmpleado).subscribe({
      next: () => {
        this.showAddModal = false;
        this.loadEmpleados();
        this.showAlert('Empleado creado exitosamente', 'success');
        this.isLoading = false;
      },
      error: (error: any) => {
        this.handleError(error, 'crear empleado');
        this.isLoading = false;
      }
    });
  }


  editEmpleado(empleado: Personal): void {
    this.empleadosSeleccionado = empleado;
    this.editForm.patchValue({
      personalId: empleado.personalId ?? 0,
      usuarioId: empleado.usuarioId ?? 0,
      nombre: empleado.nombre,
      apellidoPaterno: empleado.apellidoPaterno,
      apellidoMaterno: empleado.apellidoMaterno,
      puesto: empleado.puesto,
      fechaContratacion: empleado.fechaContratacion ?? null,
      email: empleado.usuario?.email || '',
      // No veo 'telefono' en el modelo, si existe, agrega aquí
      activo: empleado.usuario?.activo ?? true
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveEmpleado(): void {
    if (this.editForm.invalid) {
      this.markAllAsTouched(this.editForm);
      return;
    }

    const formValue = this.editForm.value;
    if (!formValue.personalId || formValue.personalId === 0) return;

    this.isLoading = true;

    const datosActualizacion: Personal = {
      personalId: formValue.personalId ?? 0,        // usa personalId, no id
      usuarioId: formValue.usuarioId ?? 0,          // igual usuarioId
      nombre: formValue.nombre || '',
      apellidoPaterno: formValue.apellidoPaterno || '',
      apellidoMaterno: formValue.apellidoMaterno || '',
      telefono: formValue.telefono || '',
      puesto: formValue.puesto || '',
      fechaContratacion: formValue.fechaContratacion || undefined,
      activo: formValue.activo ?? true
    };

    this.empleadoService.updatePersonal(formValue.personalId, datosActualizacion).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadEmpleados();
        this.showAlert('Empleado actualizado correctamente', 'success');
        this.isLoading = false;
      },
      error: (error: any) => {
        this.handleError(error, 'actualizar empleado');
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

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // Métodos para cambiar estado
  toggleEstado(empleado: Personal): void {
    if (empleado.personalId === undefined) {
      this.showAlert('Empleado sin ID, no se puede cambiar estado', 'error');
      return;
    }

    const accion = empleado.activo ? 'desactivar' : 'activar';
    if (confirm(`¿${accion.toUpperCase()} a ${empleado.nombre}?`)) {
      this.isLoading = true;
      this.empleadoService.toggleActivo(empleado.personalId).subscribe({
        next: () => this.loadEmpleados(),
        error: (error) => this.handleError(error, `${accion} empleado`)
      });
    }
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
}
