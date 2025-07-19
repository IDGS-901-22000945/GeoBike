import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from '../../layouts/admin/admin-layout/admin-layout.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, AdminLayoutComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

}
