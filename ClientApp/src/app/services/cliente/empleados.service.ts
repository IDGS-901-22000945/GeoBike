import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Usuario } from './usuario.service';

export interface Personal {
  personalId?: number;
  usuarioId?: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  email?: string;
  puesto: string;
  fechaContratacion?: string;
  activo?: boolean;
  usuario?: Usuario;  // si quieres que esté como objeto anidado
}

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private apiUrl = 'https://localhost:7097/api/personal';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ Error en la solicitud:', error);

    let errorMessage = 'Ocurrió un error';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;

      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión o que el servidor esté corriendo.';
      } else if (error.status === 404) {
        errorMessage = 'El recurso solicitado no fue encontrado.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor.';
      }
    }

    console.error('Detalles completos del error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getPersonal(): Observable<Personal[]> {
    console.log('🔄 Obteniendo personal desde:', this.apiUrl);
    return this.http.get<Personal[]>(this.apiUrl).pipe(
      tap(personal => console.log('✅ Personal recibido:', personal)),
      catchError(this.handleError)
    );
  }

  getPersonalById(id: number): Observable<Personal> {
    return this.http.get<Personal>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createPersonal(personalData: Personal): Observable<Personal> {
    return this.http.post<Personal>(this.apiUrl, personalData).pipe(
      catchError(this.handleError)
    );
  }

  updatePersonal(id: number, personalData: Personal): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, personalData).pipe(
      catchError(this.handleError)
    );
  }

  // Si no manejas toggleActivo para personal, puedes eliminar este método
  toggleActivo(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
      catchError(this.handleError)
    );
  }

  searchPersonal(searchTerm: string): Observable<Personal[]> {
    return this.http.get<Personal[]>(`${this.apiUrl}/search?q=${encodeURIComponent(searchTerm)}`).pipe(
      catchError(this.handleError)
    );
  }

  deletePersonal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
