// src/app/autenticacion/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const usuario = this.authService.obtenerUsuario();

    if (!usuario) {
      this.router.navigate(['/login']);
      return false;
    }

    const rolesPermitidos = route.data['roles'] as string[];

    if (rolesPermitidos.includes(usuario.rol)) {
      return true;
    }

    // ❌ Si no tiene el rol requerido, lo mandamos al inicio
    this.router.navigate(['/']);
    return false;
  }
}
