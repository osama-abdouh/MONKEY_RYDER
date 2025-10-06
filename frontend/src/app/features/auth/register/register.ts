import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  nome: string = '';
  cognome: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  registerForm: FormGroup;
  message: string = '';

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onRegister() {
    this.http.post('http://localhost:3000/api/register', {
      nome: this.registerForm.get('nome')?.value,
      cognome: this.registerForm.get('cognome')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
    }).subscribe({
      next: (res: any) => {
        this.message = res.message; // Mostra il messaggio dal backend
        console.log('Registrazione avvenuta:', res);
        this.router.navigate(['/login']); // Naviga al login dopo la registrazione
      },
      error: (err) => {
        this.message = err.error.message || 'Errore durante la registrazione';
        console.error('Errore durante la registrazione:', err);
      }
    });
  }
}

