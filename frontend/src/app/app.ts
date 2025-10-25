import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { Api } from './services/api';
import { SplashService } from './services/splash.service';
import { HeaderComponent } from './layuot/header/header';
import { FooterComponent } from './layuot/footer/footer';
import { SessionService } from './services/session.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  protected readonly serverStatus = signal(''); // Segnale per lo stato del server

  constructor(
    private session: SessionService,
    private api: Api,
    public splashService: SplashService,
    private router: Router,
  ) {} // Servizio semplice per splash

  ngOnInit(): void {
    // Soluzione aggressiva con doppio metodo di scroll
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      // Metodo immediato
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Backup con timer (per sicurezza)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    });
  }
}
