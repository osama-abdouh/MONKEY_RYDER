import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lowest-stock',
  imports: [CommonModule],
  templateUrl: './lowest-stock.html',
  styleUrl: './lowest-stock.css'
})
export class LowestStock {
  @Input() incomingProduct: any = null;

  // helper to format numbers as currency
  formatCurrency(v: any): string {
    if (v === null || v === undefined) return '-';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
  }

}
