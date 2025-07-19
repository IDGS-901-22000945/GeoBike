import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,  // ← Agregar esto
  imports: [CommonModule],  // ← Agregar esto
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private router: Router) { }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    console.log('Cerrando sesión...');
    this.router.navigate(['/']);
  }
}
