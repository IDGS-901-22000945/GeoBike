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

    // Mapeo exacto de campos
    const clienteData = {
      email: formData.email,
      password: formData.password, // Envía como password (el backend lo convertirá a hash)
      nombre: formData.nombre,
      apellidoPaterno: formData.apellidoPaterno,
      apellidoMaterno: formData.apellidoMaterno || '', // Manejo de nulos
      direccion: formData.direccion, // Nombre consistente con el formulario
      telefono: formData.telefono
    };

    console.log('Datos a enviar:', clienteData);

    this.clienteService.registerCliente(clienteData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.isLoading = false; // ¡IMPORTANTE! Cambiar el loading a false
        this.showSuccessAndRedirect(); // Llamar al método que ya existe
      },
      error: (error) => {
        console.error('Error completo:', error);
        if (error.error) {
          console.error('Detalles del error:', error.error);
          // Extrae mensajes de error específicos
          if (error.error.errors) {
            this.errorMessage = Object.values(error.error.errors).flat().join(', ');
          } else {
            this.errorMessage = error.error.error || error.error.message || 'Error en el registro';
          }
        }
        this.isLoading = false;
      }
    });
  } else {
    this.markAllAsTouched();
  }
}

private markAllAsTouched() {
  Object.keys(this.registerForm.controls).forEach(key => {
    this.registerForm.get(key)?.markAsTouched();
  });
}

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
