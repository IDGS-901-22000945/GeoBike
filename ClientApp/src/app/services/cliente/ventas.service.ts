import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetalleVenta {
  productoId?: number;
  servicioId?: number;
  cantidad: number;
  precioUnitario: number;
}

export interface Venta {
  ventaId?: number;
  fechaVenta?: string;
  total: number;
  tipoVenta: 'producto' | 'servicio';
  clienteId?: number;
  personalId?: number;
  detallesVenta: DetalleVenta[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = 'https://localhost:7097/api/ventas';

  constructor(private http: HttpClient) { }

  crearVenta(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta);
  }

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  getVentaById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }
}
