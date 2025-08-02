import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PedidoItemDto {
  tipo: 'producto' | 'servicio';
  itemId: number;
  cantidad: number;
}

export interface CrearPedidoDto {
  clienteId: number;
  items: PedidoItemDto[];
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = 'https://localhost:7097/api/pedidos';

  constructor(private http: HttpClient) {}

  crearPedido(pedidoDto: CrearPedidoDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedidoDto);
  }

  actualizarEstado(pedidoId: number, estado: string): Observable<any> {
    const url = `${this.apiUrl}/${pedidoId}/estado`;
    const body = { Estado: estado };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, body, { headers });
  }
}
