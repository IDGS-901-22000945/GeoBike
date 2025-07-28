import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CarritoService } from '../services/cliente/carrito.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7097/api/login';

  constructor(
    private http: HttpClient,
    private router: Router,
    private carritoService: CarritoService
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      { email, password },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json'
        })
      }
    ).pipe(
      tap(res => {
        console.log('✅ Login exitoso:', res);
        this.guardarUsuario(res);
      }),
      catchError(err => {
        console.error('❌ Error al hacer login', err);
        return throwError(() => err);
      })
    );
  }

  guardarUsuario(usuario: any) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  obtenerUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  obtenerRol(): string | null {
    const usuario = this.obtenerUsuario();
    return usuario?.rol || null;
  }

  estaAutenticado(): boolean {
    return !!this.obtenerUsuario();
  }

  getCurrentUser(): any {
    const userJson = localStorage.getItem('usuario');
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  logout(): void {
    localStorage.removeItem('usuario');
    this.carritoService.vaciar();
    this.router.navigate(['/']);
  }
}
