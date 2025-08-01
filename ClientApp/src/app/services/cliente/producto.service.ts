import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  productoId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  activo: boolean;
  imagenBase64?: string; // NUEVO CAMPO
  proveedorId?: number;
  proveedor?: {
    proveedorId: number;
    nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'https://localhost:7097/api/productos';

  constructor(private http: HttpClient) { }

  getProductos(activos?: boolean): Observable<Producto[]> {
    const params: any = {};
    if (activos !== undefined) {
      params.activos = activos;
    }
    return this.http.get<Producto[]>(this.apiUrl, { params });
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  createProducto(producto: Omit<Producto, 'productoId'>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  updateProducto(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${producto.productoId}`, producto);
  }

  toggleActivo(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-activo`, {});
  }
}
