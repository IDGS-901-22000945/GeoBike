import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ClienteService } from '../../../services/cliente/cliente.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showSuccessAlert = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: [''],
      rfc: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      direccion: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  get f() {
    return this.registerForm.controls;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${fieldName} no debe exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return `${fieldName} tiene formato inválido`;
      if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    }

    return '';
  }

  private hashPassword(password: string): string {
    return password;
  }

  private showSuccessAndRedirect() {
    this.showSuccessAlert = true;

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.registerForm.value;

      const clienteData = {
        email: formData.email,
        passwordHash: this.hashPassword(formData.password),
        nombre: formData.nombre,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno || '',
        direccionEnvio: formData.direccion,
        telefono: formData.telefono
      };

      this.clienteService.registerCliente(clienteData).subscribe({
        next: (response: any) => {
          console.log('Cliente registrado exitosamente', response);
          this.isLoading = false;
          this.showSuccessAndRedirect();
        },
        error: (error: any) => {
          console.error('Error en el registro:', error);
          this.errorMessage = error.error?.message || error.message || 'Error en el registro. Intenta de nuevo.';
          this.isLoading = false;
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
