import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Usuario } from './usuario.service';

export interface EmpleadoRegistroModel {
  email: string;
  password: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  puesto: string;
  fechaContratacion?: string;
}

export interface EmpleadoUpdateModel {
  personalId: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  puesto: string;
  fechaContratacion?: string;
}

export interface Personal {
  personalId: number;
  usuarioId: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  puesto: string;
  fechaContratacion?: string;
  email?: string;
  rol?: string;
  activo: boolean;
  usuario?: {
    usuarioId: number;
    email: string;
    rol: string;
    fechaCreacion: string;
    activo: boolean;
  } | null;
}


@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private apiUrl = 'https://localhost:7097/api';

  constructor(private http: HttpClient) {}

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

    console.group(`🔍 Detalles del error en ${operation}`);
    console.log('📊 Status:', error.status);
    console.log('📝 Status Text:', error.statusText);
    console.log('🔗 URL:', error.url);
    console.log('📄 Error Body:', error.error);
    console.log('📋 Headers:', error.headers);
    console.groupEnd();

    return throwError(() => error);
  }

  // Registro de empleado
  registerEmpleado(data: EmpleadoRegistroModel): Observable<any> {
    console.log('🔄 Registrando empleado:', data);
    return this.http.post(
      `${this.apiUrl}/empleados/register`,
      data,
      this.getHttpOptions()
    ).pipe(
      tap(response => console.log('✅ Empleado registrado:', response)),
      catchError(error => this.handleError(error, 'registerEmpleado'))
    );
  }

  // Login empleado (mismo endpoint que clientes/admins)
  loginEmpleado(email: string, password: string): Observable<any> {
    console.log('🔄 Login empleado:', email);
    return this.http.post(
      `${this.apiUrl}/auth/login`,
      { email, password },
      this.getHttpOptions()
    ).pipe(
      tap(response => console.log('✅ Login exitoso')),
      catchError(error => this.handleError(error, 'loginEmpleado'))
    );
  }

  // Obtener todos los empleados
  getPersonal(): Observable<Personal[]> {
    console.log('🔄 Obteniendo personal...');
    return this.http.get<Personal[]>(
      `${this.apiUrl}/empleados`,
      this.getHttpOptions()
    ).pipe(
      tap(data => {
        console.log('✅ Personal obtenido:', data.length);
        if (data.length > 0) {
          console.log('📋 Primer empleado:', data[0]);
        }
      }),
      catchError(error => this.handleError(error, 'getPersonal'))
    );
  }

  // Obtener empleado por ID
  getPersonalById(id: number): Observable<Personal> {
    console.log('🔄 Buscando empleado ID:', id);
    return this.http.get<Personal>(
      `${this.apiUrl}/empleados/${id}`,
      this.getHttpOptions()
    ).pipe(
      tap(emp => console.log('✅ Empleado obtenido:', emp)),
      catchError(error => this.handleError(error, 'getPersonalById'))
    );
  }

  // Actualizar empleado
  updatePersonal(id: number, data: EmpleadoUpdateModel): Observable<any> {
    console.log('🔄 Actualizando empleado ID:', id, 'Data:', data);
    return this.http.put(
      `${this.apiUrl}/empleados/${id}`,
      data,
      this.getHttpOptions()
    ).pipe(
      tap(res => console.log('✅ Empleado actualizado:', res)),
      catchError(error => this.handleError(error, 'updatePersonal'))
    );
  }

  // PATCH: Cambiar estado activo/inactivo
  toggleEstadoEmpleado(id: number): Observable<any> {
    console.log('🔄 Cambiando estado del empleado ID:', id);
    return this.http.patch(
      `${this.apiUrl}/empleados/${id}/toggle-estado`,
      {},
      this.getHttpOptions()
    ).pipe(
      tap(response => console.log('✅ Estado cambiado:', response)),
      catchError(error => this.handleError(error, 'toggleEstadoEmpleado'))
    );
  }

  // Buscar empleados por nombre, apellido, puesto o email
  searchPersonal(q: string): Observable<Personal[]> {
    console.log('🔍 Buscando personal con término:', q);
    return this.http.get<Personal[]>(
      `${this.apiUrl}/empleados/search?q=${encodeURIComponent(q)}`,
      this.getHttpOptions()
    ).pipe(
      tap(data => console.log('✅ Búsqueda completada:', data.length, 'resultados')),
      catchError(error => this.handleError(error, 'searchPersonal'))
    );
  }
}
