import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../autenticacion/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.authService.logout();
  }
}
