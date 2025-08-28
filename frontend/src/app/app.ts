import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './services/api';
import { HeaderComponent } from "./components/header/header"; // Importa il servizio Api

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  protected readonly serverStatus = signal(''); // Segnale per lo stato del server

  constructor(private api: Api) {} // Inizializza il servizio Api

  ngOnInit(): void {
    // Recupera lo stato del server al caricamento del componente
    this.api.getHealth().subscribe({
      next: (response) => {
        this.serverStatus.set(response.status); // Aggiorna lo stato del server
      },
      error: (error) => {
        console.error('Error fetching health status:', error);
        this.serverStatus.set('Server not reachable');
      }
    });
  }
}