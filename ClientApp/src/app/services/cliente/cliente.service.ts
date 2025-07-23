import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ClienteRegistroModel {
  email: string;
  password: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccion: string; // Para registro
  telefono: string;
}

export interface ClienteUpdateModel {
  clienteId: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccionEnvio: string; // Para actualización
  telefono: string;
}

export interface Cliente {
  clienteId: number;
  usuarioId: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccionEnvio: string;
  telefono: string;
  usuario?: {
    usuarioId: number;
    email: string;
    rol: string;
    FechaCreacion: string;
    activo: boolean;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'https://localhost:7097/api';

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  private handleError(error: HttpErrorResponse, operation: string) {
    console.error(`❌ Error en ${operation}:`, error);

    // Log detallado para debugging
    console.group(`🔍 Detalles del error en ${operation}`);
    console.log('📊 Status:', error.status);
    console.log('📝 Status Text:', error.statusText);
    console.log('🔗 URL:', error.url);
    console.log('📄 Error Body:', error.error);
    console.log('📋 Headers:', error.headers);
    console.groupEnd();

    return throwError(() => error);
  }

  // Registro de cliente
  registerCliente(clienteData: ClienteRegistroModel): Observable<any> {
    console.log('🔄 Registrando cliente:', clienteData);
    return this.http.post(
      `${this.apiUrl}/clientes/register`,
      clienteData,
      this.getHttpOptions()
    ).pipe(
      tap(response => console.log('✅ Cliente registrado:', response)),
      catchError(error => this.handleError(error, 'registerCliente'))
    );
  }

  // Login de cliente
  loginCliente(email: string, password: string): Observable<any> {
    console.log('🔄 Login cliente:', email);
    return this.http.post(
      `${this.apiUrl}/auth/login`,
      { email, password },
      this.getHttpOptions()
    ).pipe(
      tap(response => console.log('✅ Login exitoso')),
      catchError(error => this.handleError(error, 'loginCliente'))
    );
  }

  // GET: Obtener todos los clientes
  getClientes(): Observable<Cliente[]> {
    console.log('🔄 Obteniendo todos los clientes...');
    return this.http.get<Cliente[]>(
      `${this.apiUrl}/clientes`,
      this.getHttpOptions()
    ).pipe(
      tap(clientes => {
        console.log('✅ Clientes obtenidos:', clientes.length);
        if (clientes.length > 0) {
          console.log('📋 Estructura del primer cliente:', clientes[0]);
        }
      }),
      catchError(error => this.handleError(error, 'getClientes'))
    );
  }

  // GET: Obtener un cliente específico por ID
  getClienteById(id: number): Observable<Cliente> {
    console.log('🔄 Obteniendo cliente ID:', id);
    return this.http.get<Cliente>(
      `${this.apiUrl}/clientes/${id}`,
      this.getHttpOptions()
    ).pipe(
      tap(cliente => console.log('✅ Cliente obtenido:', cliente)),
      catchError(error => this.handleError(error, 'getClienteById'))
    );
  }

  // PUT: Actualizar un cliente
  updateCliente(id: number, clienteData: ClienteUpdateModel): Observable<any> {
    console.log('🔄 Actualizando cliente ID:', id, 'Datos:', clienteData);
    return this.http.put(
      `${this.apiUrl}/clientes/${id}`,
      clienteData,
      this.getHttpOptions()
    ).pipe(
      tap(response => console.log('✅ Cliente actualizado:', response)),
      catchError(error => this.handleError(error, 'updateCliente'))
    );
  }

  // PATCH: Cambiar estado activo/inactivo del cliente
  toggleEstadoCliente(id: number): Observable<any> {
    console.log('🔄 Cambiando estado del cliente ID:', id);

    // Primero intenta con el endpoint original
    return this.http.patch(
      `${this.apiUrl}/clientes/${id}/toggle-estado`,
      {}, // Body vacío
      this.getHttpOptions()
    ).pipe(
      tap(response => console.log('✅ Estado cambiado:', response)),
      catchError(error => {
        console.log('❌ Error con toggle-estado, intentando alternativas...');

        // Si falla, intenta con endpoint alternativo
        return this.http.patch(
          `${this.apiUrl}/clientes/${id}/estado`,
          {},
          this.getHttpOptions()
        ).pipe(
          tap(response => console.log('✅ Estado cambiado (alternativo):', response)),
          catchError(error2 => {
            // Si también falla, intenta con PUT
            return this.http.put(
              `${this.apiUrl}/clientes/${id}/toggle`,
              {},
              this.getHttpOptions()
            ).pipe(
              tap(response => console.log('✅ Estado cambiado (PUT):', response)),
              catchError(error3 => this.handleError(error3, 'toggleEstadoCliente'))
            );
          })
        );
      })
    );
  }

  // GET: Buscar clientes
  searchClientes(searchTerm: string): Observable<Cliente[]> {
    console.log('🔄 Buscando clientes:', searchTerm);
    return this.http.get<Cliente[]>(
      `${this.apiUrl}/clientes/search?q=${encodeURIComponent(searchTerm)}`,
      this.getHttpOptions()
    ).pipe(
      tap(clientes => console.log('✅ Búsqueda completada:', clientes.length, 'resultados')),
      catchError(error => this.handleError(error, 'searchClientes'))
    );
  }

  // 🆕 Método alternativo para cambiar estado con datos explícitos
  updateEstadoCliente(id: number, activo: boolean): Observable<any> {
    console.log('🔄 Actualizando estado explícito ID:', id, 'Activo:', activo);
    return this.http.patch(
      `${this.apiUrl}/clientes/${id}`,
      { activo: activo },
      this.getHttpOptions()
    ).pipe(
      tap(response => console.log('✅ Estado actualizado:', response)),
      catchError(error => this.handleError(error, 'updateEstadoCliente'))
    );
  }
}
