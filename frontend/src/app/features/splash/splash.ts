import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashService } from '../../services/splash.service';

@Component({
  selector: 'app-splashPage',
  imports: [],
  templateUrl: './splash.html',
  styleUrl: './splash.css'
})
export class SplashComponent {
  constructor(private router: Router, private splashService: SplashService) {
    // Assicurati che la splash sia attiva
    this.splashService.showSplash();
    
    // Timer di 3 secondi prima di navigare alla home
    setTimeout(() => {
      this.splashService.hideSplash(); // Nascondi splash e mostra header/footer
      this.router.navigate(['/home']);
    }, 3000);
  }
}
