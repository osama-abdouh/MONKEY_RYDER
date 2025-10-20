
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

  // trackBy for orders list to avoid Angular duplicate tracking warnings
  trackByOrderId(index: number, order: OrderDTO) {
    return order?.id_ordine ?? index;
  }

  // trackBy for order items
  trackByOrderItemId(index: number, item: any) {
    return item?.order_item_id ?? item?.product_id ?? index;
  }

  // helper to build image URL for order item (falls back to default image)
  getOrderItemImageUrl(item: any): string {
    const path = item && (item.product_image_path || item.product_image_url || item.image_path || item.product_image);
    if (path) {
      // if the path already looks like an absolute URL, return as-is
      if (/^https?:\/\//i.test(path)) return path;
      // otherwise prefix the backend base
      return `http://localhost:3000/${path}`;
    }
    return 'assets/images/no-image.png';
  }

  closeDetails(): void {
    this.selectedOrderDetails = null;
    this.detailsError = null;
    this.detailsLoading = false;
  }

  // helper used by template: true when order status is pending (accepts localized forms)
  isOrderPending(): boolean {
    const st = this.selectedOrderDetails && this.selectedOrderDetails.order && this.selectedOrderDetails.order.stato;
    if (!st) return false;
    const s = String(st).toLowerCase();
    return s === 'pending' || s === 'in attesa' || s === 'in_attesa';
  }

  // Cancel the currently selected order (only allowed when pending). Calls backend and refreshes list.
  cancelOrder(): void {
    if (!this.selectedOrderDetails || !this.selectedOrderDetails.order) return;
    const id = this.selectedOrderDetails.order.id_ordine;
    if (!id) return;
    // simple confirmation
    if (!confirm('Sei sicuro di voler annullare questo ordine?')) return;
    const token = this.session.getToken() || undefined;
    this.orderService.cancelOrder(id).subscribe({
      next: (res) => {
        // close modal and remove the order locally from the list for immediate UI update
        const idToRemove = id;
        this.orders = (this.orders || []).filter(o => o.id_ordine !== idToRemove);
        this.closeDetails();
      },
      error: (err) => {
        console.error('Errore annullamento ordine', err);
        this.detailsError = 'Impossibile annullare l\'ordine';
      }
    });
  }

  formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
  }

}
