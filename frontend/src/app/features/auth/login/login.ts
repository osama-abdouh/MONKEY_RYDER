import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  email = '';
  password = '';
  message = '';
  
  constructor(private http: HttpClient, private router: Router) {}


  OnLogin() {
    this.http.post('http://localhost:3000/api/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.message = res.message;
        console.log('Login effettuato:', res);
        this.router.navigate(['/profile']); // Aggiungi navigazione
        this.closeDropdown(); // Chiudi dropdown
        // Salva il token JWT (opzionale)
        localStorage.setItem('token', res.token);
      },
      error: (err) => {
        this.message = err.error.message;
        console.error('Errore durante il login:', err);
      }
    });
  }
  @Input() closeDropdown!: () => void; // Riceve la funzione dal genitore

}
