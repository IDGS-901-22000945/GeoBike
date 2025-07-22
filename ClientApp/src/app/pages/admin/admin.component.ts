import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../layouts/admin/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Necesario para router-outlet
    RouterOutlet, // Necesario para <router-outlet>
    AdminSidebarComponent // Importa el componente del sidebar
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
}
