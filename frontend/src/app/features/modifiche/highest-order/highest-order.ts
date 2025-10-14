import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-highest-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './highest-order.html',
  styleUrl: './highest-order.css'
})
export class HighestOrder {
  @Input() incomingMaxOrder: any = null;

  constructor(private router: Router) {}

  formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
  }

  goBack(): void {
    // navigate back to gestione; if route doesn't exist, fallback to history
    try {
      this.router.navigate(['/gestione']);
    } catch (e) {
      if (typeof history !== 'undefined') history.back();
    }
  }

}
