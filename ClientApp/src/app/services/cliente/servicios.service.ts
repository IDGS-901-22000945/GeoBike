import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private apiUrl = 'https://localhost:7097/api/servicios';

  constructor(private http: HttpClient) { }

  getServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl);
  }

  createServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, servicio);
  }

  updateServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/${servicio.servicioId}`, servicio);
  }

  toggleActivo(id: number): Observable<any> {
  return this.http.patch(`${this.apiUrl}/${id}/toggle-activo`, {});
}
}

export interface Servicio {
  servicioId: number;
  nombre: string;
  descripcion?: string;
  precioMensual?: number;
  activo: boolean;
}
