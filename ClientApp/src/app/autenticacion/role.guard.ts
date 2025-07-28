import { Injectable } from '@angular/core';
import {
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const usuario = this.authService.obtenerUsuario();

    // Si no hay usuario, redirigir
    if (!usuario) {
      this.router.navigate(['/login']);
      return false;
    }

    const rolesPermitidos = route.data?.['roles'] as string[] | undefined;
    const rolUsuario = usuario.rol;

    // Si no se especifican roles en la ruta, permitir el acceso
    if (!rolesPermitidos) {
      return true;
    }

    const tieneAcceso = rolesPermitidos.includes(rolUsuario);

    if (!tieneAcceso) {
      this.router.navigate(['/']);
    }

    return tieneAcceso;
  }
}
