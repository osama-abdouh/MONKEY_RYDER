import { Component, OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-traking',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf],
  templateUrl: './traking.html',
  styleUrls: ['./traking.css']
})
export class Traking implements OnInit, OnDestroy {
  orderId: number | null = null;
  tracking: any[] = [];
  loading = false;
  error = '';
  showAll = false;
  orderStatus: string | null = null;
  progressPercent = 0;
  progressSteps: string[] = ['Ordine ricevuto', 'In preparazione', 'Spedito', 'In transito', 'In consegna', 'Consegnato'];
  deliveryAddress: string | null = null;
  delivery: { fullName?: string; address?: string; city?: string; postalCode?: string; phone?: string } | null = null;
  hasDelivery = false;

  constructor(private route: ActivatedRoute, private orderService: OrderService, private session: SessionService) {}

  // Polling handle
  private pollHandle: any = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id'] || params['orderId']);
      if (id) {
        this.orderId = id;
        // load order details first so we have `orderStatus` available
        this.loadOrderDelivery(id);
        // then load tracking events (computeProgress will prefer orderStatus)
        this.loadTracking(id);
        // start polling every 15s to pick up order status changes
        this.startPolling(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  startPolling(orderId: number) {
    // clear existing
    this.stopPolling();
    this.pollHandle = setInterval(() => {
      // refresh both details and tracking
      this.orderService.getOrderDetails(orderId, this.session.getToken() || undefined).subscribe({
        next: (data) => {
          if (data && data.order) {
            const o = data.order;
            this.orderStatus = o.status || o.order_status || o.stato || null;
            // recompute progress and delivery mapping if delivery changed
            this.computeProgress();
          }
        },
        error: (e) => { /* ignore polling errors silently */ }
      });
      this.orderService.getOrderTracking(orderId, this.session.getToken() || undefined).subscribe({
        next: (res) => {
          this.tracking = res && res.tracking ? res.tracking : this.tracking;
          this.computeProgress();
        },
        error: (e) => { /* ignore */ }
      });
    }, 15000);
  }

  stopPolling() {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  async loadOrderDelivery(orderId: number) {
    try {
      const token = this.session.getToken() || undefined;
      this.orderService.getOrderDetails(orderId, token).subscribe({
        next: (data) => {
          console.debug('[Traking] getOrderDetails response:', data);
      if (data && data.order) {
        const o = data.order;
        // save order status if present
        this.orderStatus = o.status || o.order_status || o.stato || null;
            // Map delivery fields (support multiple aliases)
            const addr = o.delivery_address || o.address || null;
            const city = o.delivery_city || o.city || null;
            const postal = o.delivery_postal_code || o.postal_code || o.postalCode || null;
            const fullName = o.delivery_full_name || o.delivery_name || ((o.first_name || o.firstName || '') ? ((o.first_name || o.firstName || '') + ' ' + (o.last_name || o.lastName || '')) : null) || null;
            const phone = o.delivery_phone || o.delivery_phone_number || o.phone || null;

            const mapped = {
              fullName: fullName || undefined,
              address: addr || undefined,
              city: city || undefined,
              postalCode: postal || undefined,
              phone: phone || undefined
            };
            const anyField = !!(mapped.fullName || mapped.address || mapped.city || mapped.postalCode || mapped.phone);
            this.hasDelivery = anyField;
            if (anyField) {
              this.delivery = mapped;
              this.deliveryAddress = [mapped.address, mapped.city, mapped.postalCode].filter(Boolean).join(', ');
            } else {
              this.delivery = null;
              this.deliveryAddress = null;
            }
            // recalc progress because order status may determine completion
            this.computeProgress();
          }
        },
        error: (err) => {
          console.error('Errore fetching order details for delivery address', err);
          this.deliveryAddress = null;
          this.delivery = null;
          this.hasDelivery = false;
        }
      });
    } catch (e) {
      console.error('loadOrderDelivery error', e);
      this.deliveryAddress = null;
    }
  }

  loadTracking(id: number) {
    this.loading = true;
    this.error = '';
    // If the app stores token in session storage or a service, you can pass it here.
    this.orderService.getOrderTracking(id).subscribe({
      next: (res) => {
        this.tracking = res && res.tracking ? res.tracking : [];
        // compute progress based on tracking events
        this.computeProgress();
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore fetching tracking', err);
        this.error = 'Impossibile caricare i dati di tracking';
        this.loading = false;
      }
    });
  }

  // Compute progress percent based on tracking events and order status.
  computeProgress() {
    // Mapping values for progress steps
    const statusMap: { [k: string]: number } = {
      'pending': 0,
      'in attesa': 0,
      'ricevuto': 0,
      'ordine ricevuto': 0,
      'in preparazione': 1,
      'preparazione': 1,
      'prepar': 1,
      'spedito': 2,
      'sped': 2,
      'in transito': 3,
      'transit': 3,
      'in consegna': 4,
      'consegna': 4,
      'consegnato': 5,
      'completed': 5,
      'delivered': 5,
      'annullato': 0,
      'cancelled': 0
    };

    if (!this.tracking || this.tracking.length === 0) {
      this.progressPercent = 5;
      console.debug('[Traking] computeProgress -> no tracking events, percent', this.progressPercent);
      return;
    }

    // find latest event by data_evento
    let latest = this.tracking[0];
    for (const ev of this.tracking) {
      try {
        if (ev && ev.data_evento) {
          const tEv = new Date(ev.data_evento).getTime() || 0;
          const tLatest = latest && latest.data_evento ? new Date(latest.data_evento).getTime() : 0;
          if (tEv > tLatest) latest = ev;
        }
      } catch (e) { /* ignore */ }
    }

    const stateText = (latest.stato_pacco || '').toString().toLowerCase().trim();
    let stepIndex = -1;
    if (stateText) {
      if (statusMap.hasOwnProperty(stateText)) {
        stepIndex = statusMap[stateText];
      } else {
        for (const k of Object.keys(statusMap)) {
          if (stateText.indexOf(k) !== -1) { stepIndex = statusMap[k]; break; }
        }
      }
    }

    if (stepIndex >= 0) {
      const totalSteps = this.progressSteps.length - 1;
      const percent = Math.round((stepIndex / totalSteps) * 100);
      this.progressPercent = Math.max(0, Math.min(100, percent));
      console.debug('[Traking] computeProgress -> from latest stato_pacco', stateText, '-> step', stepIndex, 'percent', this.progressPercent);
      return;
    }

    // fallback: scan all events for keyword hints
    const stepKeywords = [
      { key: 'ricev', step: 0 },
      { key: 'prepar', step: 1 },
      { key: 'sped', step: 2 },
      { key: 'transit', step: 3 },
      { key: 'in consegna', step: 4 },
      { key: 'consegn', step: 5 },
      { key: 'deliv', step: 5 }
    ];

    let maxStep = 0;
    for (const ev of this.tracking) {
      const text = ((ev.stato_pacco || '') + ' ' + (ev.note || '') + ' ' + (ev.localita || '')).toLowerCase();
      for (const sk of stepKeywords) {
        if (text.indexOf(sk.key) !== -1) {
          if (sk.step > maxStep) maxStep = sk.step;
        }
      }
    }

    const totalSteps = this.progressSteps.length - 1;
    const percent = Math.round((maxStep / totalSteps) * 100);
    this.progressPercent = Math.max(5, Math.min(100, percent));
    console.debug('[Traking] computeProgress -> from tracking events maxStep', maxStep, 'percent', this.progressPercent);
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
  }

  // Whether the current order can be cancelled (pending/received/preparing)
  isCancellable(): boolean {
    if (!this.orderId) return false;
    // Prefer the latest tracking event's stato_pacco
    let latest: any = null;
    if (this.tracking && this.tracking.length > 0) {
      for (const ev of this.tracking) {
        if (!latest) { latest = ev; continue; }
        try {
          const tEv = ev && ev.data_evento ? new Date(ev.data_evento).getTime() : 0;
          const tLatest = latest && latest.data_evento ? new Date(latest.data_evento).getTime() : 0;
          if (tEv > tLatest) latest = ev;
        } catch (e) { /* ignore */ }
      }
    }
    let s = latest && latest.stato_pacco ? latest.stato_pacco : null;
    // fallback to orderStatus or delivery-stored status
    if (!s) s = this.orderStatus || (this.delivery && (this.delivery as any).stato) || null;
    if (!s) return false;
    const ss = String(s).toLowerCase();
    return ss.includes('pending') || ss.includes('in attesa') || ss.includes('ricev') || ss.includes('prepar');
  }

  // Cancel order via API
  cancelOrder() {
    if (!this.orderId) return;
    if (!confirm('Sei sicuro di voler annullare questo ordine?')) return;
    const token = this.session.getToken() || undefined;
    this.orderService.cancelOrder(this.orderId).subscribe({
      next: (res) => {
        console.debug('[Traking] cancelOrder response', res);
        // refresh details and progress
        this.loadOrderDelivery(this.orderId!);
        this.loadTracking(this.orderId!);
      },
      error: (err) => {
        console.error('Errore cancelling order', err);
        alert('Impossibile annullare l\'ordine');
      }
    });
  }
}
