import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  first_name: string = '';
  last_name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  registerForm: FormGroup;
  message: string = '';

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

passwordMatchValidator(form: FormGroup) {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  
  if (password !== confirmPassword) {
    form.get('confirmPassword')?.setErrors({ mismatch: true });
  } else {
    const errors = form.get('confirmPassword')?.errors;
    if (errors) {
      delete errors['mismatch'];
    }
  }
  return null;
}

  onRegister() {
    this.http.post('http://localhost:3000/api/register', {
      first_name: this.registerForm.get('first_name')?.value,
      last_name: this.registerForm.get('last_name')?.value,
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

