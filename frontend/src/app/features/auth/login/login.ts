import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; //??
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  error='';
  @Input() closeDropdown!: () => void; // Riceve la funzione dal genitore

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  OnLogin() {
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.router.navigate(['/home']);
        this.closeDropdown?.(); // Chiude il dropdown se la funzione è definita
      },
      error: (error) => {
        this.error = 'Email o password errati.';
        console.error('Errore durante il login:', error);
      }
    });
  }
}