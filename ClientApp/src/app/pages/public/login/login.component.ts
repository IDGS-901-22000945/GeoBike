import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../autenticacion/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  error = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: (usuario) => {
        const { rol, usuarioId, clienteId } = usuario;
        console.log('🔐 Login exitoso. Rol:', rol);
        console.log('👤 Usuario ID:', usuarioId);
        console.log('🧾 Cliente ID:', clienteId);

        // Guarda la info del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify({ rol, usuarioId, clienteId }));

        // Redirige según el rol
        if (rol === 'cliente') {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.error = 'Credenciales inválidas';
        console.error('❌ Error en login:', err);
      }
    });
  }

  navigateToRegister() {
    console.log('➡️ Navegando a registro');
    this.router.navigate(['/registro']);
  }
}
