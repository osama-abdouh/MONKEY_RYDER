
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderDTO } from '../../services/order.service';
import { SessionService } from '../../services/session.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orfini',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orfini.html',
  styleUrls: ['./orfini.css']
})
export class Orfini implements OnInit {
  orders: OrderDTO[] = [];
  isLoading = false;
  error: string | null = null;
  // Modal / detail state
  detailsLoading = false;
  selectedOrderDetails: any = null; // { order, items }
  detailsError: string | null = null;

  constructor(private orderService: OrderService, private session: SessionService) {}

  ngOnInit(): void {
    this.loadMyOrders();
  }

  loadMyOrders(): void {
    this.isLoading = true;
    this.error = null;
    const token = this.session.getToken() || undefined;
    this.orderService.getMyOrders(token).subscribe({
      next: (data) => { this.orders = data || []; this.isLoading = false; },
      error: (err) => { console.error('Errore recupero ordini utente', err); this.error = 'Impossibile caricare gli ordini'; this.isLoading = false; }
    });
  }

  openOrderDetails(orderId: number): void {
    this.detailsLoading = true;
    this.detailsError = null;
    this.selectedOrderDetails = null;
    const token = this.session.getToken() || undefined;
    this.orderService.getOrderDetails(orderId, token).subscribe({
      next: (data) => { console.log('Order details response:', data); this.selectedOrderDetails = data; this.detailsLoading = false; },
      error: (err) => { console.error('Errore recupero dettagli ordine', err); this.detailsError = 'Impossibile caricare i dettagli'; this.detailsLoading = false; }
    });
  }

  closeDetails(): void {
    this.selectedOrderDetails = null;
    this.detailsError = null;
    this.detailsLoading = false;
  }

  formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
  }

}
