import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splashPage',
  imports: [],
  templateUrl: './splashPage.html',
  styleUrl: './splashPage.css'
})
export class SplashPage {
  constructor(private router: Router) {
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 3000);
  }
}
