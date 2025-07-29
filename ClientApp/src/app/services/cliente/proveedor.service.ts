import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ProveedorRegistroModel {
  nombre: string;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  activo?: boolean;
}

export interface ProveedorUpdateModel {
  proveedorId: number;
  nombre: string;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
}

export interface Proveedor {
  proveedorId: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private apiUrl = 'https://localhost:7097/api/proveedores';

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

  getProveedores(): Observable<Proveedor[]> {
    console.log('🔄 Obteniendo proveedores desde:', this.apiUrl);
    return this.http.get<Proveedor[]>(this.apiUrl).pipe(
      tap(proveedores => console.log('✅ Proveedores recibidos:', proveedores)),
      catchError(this.handleError)
    );
  }

  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProveedor(proveedorData: ProveedorRegistroModel): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedorData).pipe(
      catchError(this.handleError)
    );
  }

  updateProveedor(id: number, proveedorData: ProveedorUpdateModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, proveedorData).pipe(
      catchError(this.handleError)
    );
  }

  toggleActivo(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
      catchError(this.handleError)
    );
  }

 searchProveedores(searchTerm: string): Observable<Proveedor[]> {
  return this.http.get<Proveedor[]>(this.apiUrl, {
    params: { search: searchTerm } // Usa el mismo parámetro que espera el backend
  }).pipe(
    catchError(this.handleError)
  );
}

  deleteProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
