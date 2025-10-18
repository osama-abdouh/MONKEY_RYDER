import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService, OrderDTO } from '../../../services/order.service';

@Component({
  selector: 'app-highest-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './highest-order.html',
  styleUrl: './highest-order.css'
})
export class HighestOrder implements OnInit {
  @Input() incomingMaxOrder: any = null;
  orders: OrderDTO[] = [];
  isLoading = false;
  error: string | null = null;
  showOnlyPending = false;

  constructor(private router: Router, private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    const source$ = this.showOnlyPending
      ? this.orderService.getPendingOrders()
      : this.orderService.getAllOrders();
    source$.subscribe({
      next: (data) => { this.orders = data || []; this.isLoading = false; },
      error: (err) => { console.error('Failed to load orders', err); this.error = 'Errore nel caricamento ordini'; this.isLoading = false; }
    });
  }

  togglePending(): void {
    this.showOnlyPending = !this.showOnlyPending;
    this.loadOrders();
  }

  cancel(o: OrderDTO): void {
    if (!o || !o.id_ordine) return;
    if ((o.stato || '').toLowerCase() !== 'pending' && (o.stato || '').toLowerCase() !== 'in attesa') return;
    this.isLoading = true;
    this.orderService.cancelOrder(o.id_ordine).subscribe({
      next: () => { this.loadOrders(); },
      error: (err) => { console.error('Failed to cancel order', err); this.error = 'Errore durante l\'annullamento'; this.isLoading = false; }
    });
  }

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
