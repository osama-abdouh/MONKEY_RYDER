import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  onRegister(): void {
    this.message = `Benvenuto, ${this.username}! Registrazione completata.`;
  }
}
