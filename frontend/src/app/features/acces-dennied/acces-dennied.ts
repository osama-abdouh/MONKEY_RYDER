// access-denied.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="access-denied">
      <h2>Accesso Negato</h2>
      <p>Non hai i permessi necessari per accedere a questa pagina.</p>
      <button (click)="goHome()">Torna alla Home</button>
    </div>
  `,
  styles: [`
    .access-denied {
      text-align: center;
      margin-top: 50px;
    }
    .access-denied h2 {
      color: red;
      margin-bottom: 1rem;
    }
    .access-denied p {
      font-size: 18px;
      color: #D64933;
      padding-bottom: 3rem;
    }
    .access-denied button{
      margin-left: 10px;
      padding: 8px 16px;
      background-color: #D64933;
      color: #E0E0E0;
      border: none;
      border-radius: 2px;
      cursor: pointer;
    }
  `]
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}
  
  goHome(): void {
    this.router.navigate(['/home']);
  }
}