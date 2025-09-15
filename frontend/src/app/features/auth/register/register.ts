import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  email: string = ''; //Codice fiscale o P.IVA
  nome: string = '';
  cognome: string = '';
  telefono: string = '';
  ID: string = '';
  indirizzo: string = '';
  message: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    this.http.post('http://localhost:3000/api/register', {
      username: this.username,
      password: this.password,
      email: this.email
    }).subscribe({
      next: (res: any) => {
        this.message = res.message;
        console.log('Registrazione avvenuta:', res);
      },
      error: (err) => {
        this.message = err.error.error;
        console.error('Errore durante la registrazione:', err);
      }
    });
  }
}

