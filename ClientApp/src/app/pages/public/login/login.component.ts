import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router: Router) {} // Inyecta Router aquí

  navigateToRegister() {
    console.log('Intentando navegar a registro');
    this.router.navigate(['/registro']);
  }
}
