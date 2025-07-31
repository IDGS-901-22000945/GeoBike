import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../autenticacion/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}

  showUserMenu = false;
  usuarioNombre = "C Liente";

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  getInitials(name: string): string {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  }

  logout() {
    this.authService.logout();
  }

  get usuarioLogueado() {
    return this.authService.obtenerUsuario();
  }
}
