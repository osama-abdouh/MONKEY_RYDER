
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { OrderService, OrderDTO } from '../../services/order.service';
import { SessionService } from '../../services/session.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orfini',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, RouterModule],
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
    // also fetch tracking and compute latest stato_pacco to show in the modal
    this.orderService.getOrderTracking(orderId, token).subscribe({
      next: (res) => {
        try {
          const tracking = res && res.tracking ? res.tracking : [];
          if (!this.selectedOrderDetails) this.selectedOrderDetails = { order: { id_ordine: orderId } };
          // pick latest by data_evento
          let latest = null as any;
          for (const ev of tracking) {
            if (!latest) { latest = ev; continue; }
            try {
              const tEv = ev && ev.data_evento ? new Date(ev.data_evento).getTime() : 0;
              const tLatest = latest && latest.data_evento ? new Date(latest.data_evento).getTime() : 0;
              if (tEv > tLatest) latest = ev;
            } catch (e) { /* ignore */ }
          }
          if (latest && latest.stato_pacco) {
            if (!this.selectedOrderDetails.order) this.selectedOrderDetails.order = {} as any;
            this.selectedOrderDetails.order.stato_pacco_latest = latest.stato_pacco;
          }
        } catch (e) { console.warn('Failed to compute latest tracking state', e); }
      },
      error: (err) => { /* ignore tracking fetch errors for modal */ }
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
    // Prefer the latest tracking state (stato_pacco_latest). Fall back to order.stato or the orders list.
    const order = this.selectedOrderDetails && this.selectedOrderDetails.order ? this.selectedOrderDetails.order : null;
    let st = order && order.stato_pacco_latest ? order.stato_pacco_latest : (order && order.stato ? order.stato : null);
    // if still missing, try to find the order entry in the list (may have been enriched)
    if (!st && order && order.id_ordine) {
      const o = this.orders.find(x => x.id_ordine === order.id_ordine);
      if (o) st = (o as any).stato_pacco_latest || (o as any).stato || null;
    }
    if (!st) return false;
    const s = String(st).toLowerCase();
    // treat several localized statuses as cancellable
    const cancellable = [
      'ordine ricevuto', 'ricevuto',
      'in preparazione', 'preparazione',
    ];
    for (const c of cancellable) {
      if (s === c || s.indexOf(c) !== -1) return true;
    }
    return false;
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
