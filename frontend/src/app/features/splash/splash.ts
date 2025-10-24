import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashService } from '../../services/splash.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splashPage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.html',
  styleUrls: ['./splash.css']
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
