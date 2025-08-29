import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './services/api';
import { SplashService } from './services/splash.service';
import { HeaderComponent } from "./layuot/header/header";
import { FooterComponent } from "./layuot/footer/footer";
import { ColabComponent } from "./layuot/colab/colab";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ColabComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  protected readonly serverStatus = signal(''); // Segnale per lo stato del server

  constructor(private api: Api, public splashService: SplashService) {} // Servizio semplice per splash

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