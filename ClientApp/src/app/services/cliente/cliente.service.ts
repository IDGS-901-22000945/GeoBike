import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClienteRegistroModel {
  email: string;
  passwordHash: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccionEnvio: string;
  telefono: string;
}

export interface ClienteUpdateModel {
  clienteId: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccionEnvio: string;
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
        'Content-Type': 'application/json'
      })
    };
  }

  // Registro de cliente
  registerCliente(clienteData: ClienteRegistroModel): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/clientes/register`,
      clienteData,
      this.getHttpOptions()
    );
  }

  // Login de cliente
  loginCliente(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/login`,
      { email, password },
      this.getHttpOptions()
    );
  }

  // **NUEVOS MÉTODOS QUE FALTABAN**

  // GET: Obtener todos los clientes
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(
      `${this.apiUrl}/clientes`,
      this.getHttpOptions()
    );
  }

  // GET: Obtener un cliente específico por ID
  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(
      `${this.apiUrl}/clientes/${id}`,
      this.getHttpOptions()
    );
  }

  // PUT: Actualizar un cliente
  updateCliente(id: number, clienteData: ClienteUpdateModel): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/clientes/${id}`,
      clienteData,
      this.getHttpOptions()
    );
  }

  // PATCH: Cambiar estado activo/inactivo del cliente
  toggleEstadoCliente(id: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/clientes/${id}/toggle-estado`,
      {}, // Body vacío para el PATCH
      this.getHttpOptions()
    );
  }

  // GET: Buscar clientes
  searchClientes(searchTerm: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(
      `${this.apiUrl}/clientes/search?q=${encodeURIComponent(searchTerm)}`,
      this.getHttpOptions()
    );
  }
}
