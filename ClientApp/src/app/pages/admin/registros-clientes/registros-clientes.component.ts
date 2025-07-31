import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente, ClienteUpdateModel } from '../../../services/cliente/cliente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registros-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registros-clientes.component.html',
  styleUrl: './registros-clientes.component.css'
})
export class RegistrosClientesComponent implements OnInit {

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;

  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenamiento: string = 'recientes';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  isLoading: boolean = false;
  error: string | null = null;

  showEditModal: boolean = false;
  editForm: ClienteUpdateModel = {
    clienteId: 0,
    email: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    direccionEnvio: '',
    telefono: ''
  };

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  alertMessage: string = '';
  alertClass: string = '';
  alertIcon: string = '';


  // Método helper para manejar errores
  private handleError(error: any, operation: string): void {
    console.error(`❌ Error en ${operation}:`, error);

    let errorMessage = 'Error desconocido';

    if (error.status === 0) {
      errorMessage = `❌ No se puede conectar al servidor (${this.getServerUrl()}).
                      Verifica que el servidor esté funcionando en https://localhost:7097`;
    } else if (error.status === 500) {
      errorMessage = `❌ Error interno del servidor (500).
                      Revisa los logs del backend para más detalles.`;
    } else if (error.status === 404) {
      errorMessage = `❌ Endpoint no encontrado (404).
                      Verifica que la ruta ${error.url} existe en tu API.`;
    } else if (error.status === 401) {
      errorMessage = '❌ No autorizado (401). Verifica la autenticación.';
    } else if (error.status === 403) {
      errorMessage = '❌ Acceso denegado (403). No tienes permisos.';
    } else if (error.error?.message) {
      errorMessage = `❌ ${error.error.message}`;
    } else if (error.message) {
      errorMessage = `❌ ${error.message}`;
    }

    this.error = errorMessage;
    this.isLoading = false;

    // Log detallado para debugging
    console.group(`🔍 Detalles del error en ${operation}`);
    console.log('📊 Status:', error.status);
    console.log('📝 Status Text:', error.statusText);
    console.log('🔗 URL:', error.url);
    console.log('📄 Error Body:', error.error);
    console.log('🏠 Full Error Object:', error);
    console.groupEnd();
  }

  private getServerUrl(): string {
    return 'https://localhost:7097/api';
  }

  // Cargar todos los clientes
  // Reemplaza tu método loadClientes actual con este:
loadClientes(): void {
  this.isLoading = true;
  this.error = null;
  console.log('🔍 Iniciando carga de clientes desde:', this.getServerUrl());

  this.clienteService.getClientes().subscribe({
    next: (clientes) => {
      console.log('✅ Clientes cargados exitosamente:', clientes);

      // 🐛 DEBUG COMPLETO - Muestra TODA la estructura
      if (clientes.length > 0) {
        const primerCliente = clientes[0];
        console.group('🔍 ESTRUCTURA COMPLETA DEL PRIMER CLIENTE');
        console.log('📋 Cliente completo:', primerCliente);
        console.log('🔑 Todas las propiedades:', Object.keys(primerCliente));

        // Buscar email en todas las propiedades posibles
        console.log('📧 Búsqueda de EMAIL:');
        console.log('  - email:', (primerCliente as any).email);
        console.log('  - usuario?.email:', primerCliente.usuario?.email);

        // Buscar estado en todas las propiedades posibles
        console.log('🎯 Búsqueda de ESTADO:');
        console.log('  - activo:', (primerCliente as any).activo);
        console.log('  - usuario?.activo:', primerCliente.usuario?.activo);

        // Si hay usuario anidado, mostrar sus propiedades
        if (primerCliente.usuario) {
          console.log('👤 Usuario completo:', primerCliente.usuario);
        }

        console.groupEnd();
      }

      this.clientes = clientes;
      this.applyFilters();
      this.isLoading = false;
    },
    error: (error) => {
      this.handleError(error, 'cargar clientes');
    }
  });
}

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      this.error = null;
      console.log('🔍 Buscando clientes con término:', this.searchTerm);

      this.clienteService.searchClientes(this.searchTerm).subscribe({
        next: (clientes) => {
          console.log('✅ Búsqueda exitosa:', clientes);
          this.clientes = clientes;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error, 'buscar clientes');
        }
      });
    } else {
      this.loadClientes();
    }
  }

applyFilters(): void {
  let clientesFiltrados = [...this.clientes];

  if (this.filtroEstado !== 'todos') {
    const esActivo = this.filtroEstado === 'activos';
    clientesFiltrados = clientesFiltrados.filter(cliente =>
      (cliente as any).activo === esActivo
    );
  }

  switch (this.ordenamiento) {
    case 'recientes':
      clientesFiltrados.sort((a, b) =>
        new Date((b as any).fechaCreacion || '').getTime() -
        new Date((a as any).fechaCreacion || '').getTime()
      );
      break;
    case 'antiguos':
      clientesFiltrados.sort((a, b) =>
        new Date((a as any).fechaCreacion || '').getTime() -
        new Date((b as any).fechaCreacion || '').getTime()
      );
      break;
    case 'nombre-az':
      clientesFiltrados.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
      break;
  }

  this.clientesFiltrados = clientesFiltrados;
  this.totalItems = clientesFiltrados.length;
  this.currentPage = 1;
}

// ✅ TAMBIÉN AGREGA ESTA FUNCIÓN HELPER EN TU COMPONENTE:
getClienteProperty(cliente: any, property: string): any {
  return cliente[property];
}

toggleEstado(cliente: Cliente): void {
  const accion = cliente.usuario?.activo ? 'desactivar' : 'activar';
  const estadoFuturo = cliente.usuario?.activo ? 'desactivado' : 'activado';

  Swal.fire({
    title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} cliente?`,
    html: `Estás a punto de <strong>${accion}</strong> el acceso de:<br>
           <b>${cliente.nombre} ${cliente.apellidoPaterno}</b><br>
           <small>ID: ${cliente.clienteId}</small>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: `Sí, ${accion}`,
    cancelButtonText: 'Cancelar',
    backdrop: `
      rgba(0,0,0,0.7)
      url("/assets/images/warning-icon.png")
      center left
      no-repeat
    `
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      // Mostrar loader mientras se procesa
      Swal.fire({
        title: 'Procesando...',
        html: `Por favor espera mientras ${accion} el cliente`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.clienteService.toggleEstadoCliente(cliente.clienteId).subscribe({
        next: (response) => {
          Swal.fire({
            title: '¡Éxito!',
            text: `El cliente ha sido ${estadoFuturo} correctamente`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 2000,
            timerProgressBar: true
          });
          this.loadClientes();
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: `No se pudo ${accion} el cliente: ${error.message}`,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          this.handleError(error, `${accion} cliente`);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  });
}

  // Abrir modal de edición
editCliente(cliente: Cliente): void {
  Swal.fire({
    title: '¿Editar cliente?',
    text: `Vas a editar los datos de ${cliente.nombre} ${cliente.apellidoPaterno}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, editar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.clienteSeleccionado = cliente;
      this.editForm = {
        clienteId: cliente.clienteId,
        email: (cliente as any).email || '',
        nombre: cliente.nombre,
        apellidoPaterno: cliente.apellidoPaterno,
        apellidoMaterno: cliente.apellidoMaterno || '',
        direccionEnvio: cliente.direccionEnvio,
        telefono: cliente.telefono
      };
      this.showEditModal = true;
    }
  });
}

  // Guardar cambios del cliente
saveCliente(): void {
  if (this.editForm.clienteId) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas guardar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });

        Toast.fire({
          icon: 'info',
          title: 'Guardando cambios...'
        });

        this.clienteService.updateCliente(this.editForm.clienteId, this.editForm).subscribe({
          next: (response) => {
            Toast.fire({
              icon: 'success',
              title: 'Cliente actualizado'
            });
            this.showEditModal = false;
            this.loadClientes();
          },
          error: (error) => {
            Toast.fire({
              icon: 'error',
              title: 'Error al guardar'
            });
            this.handleError(error, 'actualizar cliente');
            this.showEditModal = false;
          }
        });
      }
    });
  }
}


  // Cerrar modal
  closeModal(): void {
    this.showEditModal = false;
    this.clienteSeleccionado = null;
    this.error = null; // Limpiar errores al cerrar
  }

  // Limpiar error manualmente
  clearError(): void {
    this.error = null;
  }

  // Reintentar última operación
  retry(): void {
    this.error = null;
    this.loadClientes();
  }

  // Generar iniciales para avatar
  getInitials(nombre: string, apellido: string): string {
    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  }

  // Obtener color de avatar basado en el nombre
  getAvatarColor(nombre: string): string {
    return 'bg-yellow-100 text-yellow-600';
  }

  // Formatear fecha
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX');
  }

  // Métodos de paginación
  get paginatedClientes(): Cliente[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.clientesFiltrados.slice(startIndex, startIndex + this.itemsPerPage);
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

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
