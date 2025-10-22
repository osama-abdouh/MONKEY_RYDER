import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { UserService, User} from '../../../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  first_name: string = '';
  last_name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  registerForm: FormGroup;
  message: string = '';

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder, private userService: UserService) {
    this.registerForm = this.fb.group(
      {
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
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
    if (this.registerForm.invalid) {
      this.message = 'Compila tutti i campi richiesti correttamente.';
      return;
    }

    const userData: User = this.registerForm.value; // Ottieni i dati dal form
    this.userService.registerUser(userData).subscribe({
      next: (response) => {
        this.message = 'Registrazione avvenuta con successo!';
        console.log('Risposta dal server:', response);
        this.registerForm.reset();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.message = err.error.message || 'Errore durante la registrazione.';
        console.error('Errore:', err);
      },
    });
  }
}
