import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../cart.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionService } from '../../../services/session.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private sub?: Subscription;

  // Payment modal state
  showPayment = false;
  paying = false;
  paymentError: string | null = null;
  payment = {
    name: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  };

  delivery = {
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  };

  // coupon state
  couponCode = '';
  couponApplied = false;
  couponMessage: string | null = null;
  // mock coupons map (code -> percent)
  coupons: Record<string, number> = {
    PROMO10: 10,
    PROMO20: 20
  };
  appliedDiscountPercent = 0;
  // raw discount info from backend
  couponDiscountValue = 0;
  couponDiscountType: 'percent' | 'fixed' | null = null;

  constructor(private cartService: CartService, private auth: AuthService, private http: HttpClient, private session: SessionService) {}

  ngOnInit(): void {
    this.sub = this.cartService.cart$.subscribe((items: CartItem[]) => this.cartItems = items);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getTotalPrice(): number {
    const total = this.cartService.getTotalPrice();
    if (this.couponApplied && this.appliedDiscountPercent > 0) {
      return +(total * (1 - this.appliedDiscountPercent / 100)).toFixed(2);
    }
    return total;
  }

  openPayment(): void {
    if (!this.auth.isAuthenticated()) return;
    this.paymentError = null;
    this.showPayment = true;
  }

  closePayment(): void {
    if (this.paying) return;
    this.showPayment = false;
    this.paymentError = null;
    this.payment = { name: '', number: '', expiryMonth: '', expiryYear: '', cvv: '' };
  }

  confirmPayment(): void {
    if (this.paying) return;
    const { name, number, expiryMonth, expiryYear, cvv } = this.payment;
    if (!name || !number || !expiryMonth || !expiryYear || !cvv) {
      this.paymentError = 'Compila tutti i campi';
      return;
    }
    const digitsOnly = (s: string) => String(s || '').replace(/\s|-/g, '');
    const num = digitsOnly(number);
    if (!/^\d{16}$/.test(num)) {
      this.paymentError = 'Numero carta non valido';
      return;
    }
    const mm = Number(expiryMonth);
    if (!(mm >= 1 && mm <= 12)) {
      this.paymentError = 'Mese scadenza non valido';
      return;
    }
    const yy = String(expiryYear).length === 2 ? Number('20' + expiryYear) : Number(expiryYear);
    const currentYear = new Date().getFullYear();
    if (!(yy >= currentYear && yy <= currentYear + 15)) {
      this.paymentError = 'Anno scadenza non valido';
      return;
    }
    if (!/^\d{3}$/.test(cvv)) {
      this.paymentError = 'CVV non valido';
      return;
    }
    this.paymentError = null;
    this.paying = true;
    const api = 'http://localhost:3000/api';
    const token = this.session.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const prezzo = this.getTotalPrice();
    this.http.post<any>(`${api}/orders`, {
      prezzo,
      payment_provider: 'mock',
      payment_ref: null
    }, { headers }).subscribe({
      next: (created) => {
        const id_ordine = created?.id_ordine;
        this.http.post<any>(`${api}/orders/confirm-payment`, {
          id_ordine,
          payment_ref: 'MOCK-' + Date.now(),
          items: this.cartItems.map(i => ({ product_id: i.productId, quantity: i.quantity, unit_price: i.price }))
        }, { headers }).subscribe({
          next: () => {
            try {
              this.submitDeliveryData(id_ordine);
            } catch (e) {
              console.error('Error submitting delivery data', e);
            }
            this.paying = false;
            this.showPayment = false;
            alert('Pagamento confermato');
            this.cartService.clear();
          },
          error: (e2) => {
            console.error('Confirm payment failed', e2);
            this.paymentError = 'Errore conferma pagamento';
            this.paying = false;
          }
        });
      },
      error: (e) => {
        console.error('Create order failed', e);
        this.paymentError = 'Errore creazione ordine';
        this.paying = false;
      }
    });
  }

  submitDeliveryData(orderId: number) {
    const deliveryData = {
      delivery_address: this.delivery.address,
      delivery_city: this.delivery.city,
      delivery_postal_code: this.delivery.postalCode,
      delivery_phone: this.delivery.phone
    };
    const api = 'http://localhost:3000/api';
    const token = this.session.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.cartService.updateDeliveryData(orderId, deliveryData, { headers }).subscribe({
      next: (response) => {
        console.log('Delivery data updated successfully:', response);
      },
      error: (err) => {
        console.error('Failed to update delivery data:', err);
      }
    });
  }

  applyCoupon() {
    const code = String(this.couponCode || '').trim().toUpperCase();
    if (!code) {
      this.couponMessage = 'Inserisci un codice coupon';
      return;
    }
    const api = 'http://localhost:3000/api';
    const orderTotal = this.cartService.getTotalPrice();

    this.http.post<any>(`${api}/coupons/validate`, { code, orderTotal }).subscribe({
      next: (res) => {
        if (res && res.valid) {
          const discount = Number(res.discount || 0);
          if (res.coupon) {
            this.couponDiscountType = res.coupon.discountType === 'percent' ? 'percent' : 'fixed';
            this.couponDiscountValue = Number(res.coupon.discountValue || 0);
          } else {
            this.couponDiscountType = null;
            this.couponDiscountValue = 0;
          }
          if (this.couponDiscountType === 'percent') {
            this.appliedDiscountPercent = this.couponDiscountValue;
          } else if (this.couponDiscountType === 'fixed') {
            const total = this.cartService.getTotalPrice();
            this.appliedDiscountPercent = total > 0 ? Math.round((discount / total) * 100) : 0;
          } else {
            this.appliedDiscountPercent = 0;
          }
          this.couponApplied = true;
          this.couponMessage = 'Coupon applicato';
        } else {
          this.couponApplied = false;
          this.couponMessage = res && res.message ? res.message : 'Coupon non valido';
        }
      },
      error: (err) => {
        const percent = this.coupons[code];
        if (percent) {
          this.couponDiscountType = 'percent';
          this.couponDiscountValue = percent;
          this.appliedDiscountPercent = percent;
          this.couponApplied = true;
          this.couponMessage = 'Coupon applicato (fallback)';
        } else {
          this.couponApplied = false;
          this.couponMessage = 'Coupon non valido';
        }
      }
    });
  }

  removeCoupon() {
    this.couponApplied = false;
    this.appliedDiscountPercent = 0;
    this.couponCode = '';
    this.couponMessage = null;
    this.couponDiscountValue = 0;
    this.couponDiscountType = null;
  }

  // saved addresses feature
  addresses: any[] = [];
  showAddresses = false;
  loadingAddresses = false;
  addressesError: string | null = null;
  savingAddress = false;
  addressesSuccess: string | null = null;

  toggleAddresses(): void {
    if (!this.auth.isAuthenticated()) {
      this.addressesError = 'Devi essere loggato per vedere gli indirizzi salvati';
      return;
    }
    this.showAddresses = !this.showAddresses;
    this.addressesError = null;
    if (this.showAddresses && this.addresses.length === 0) {
      this.loadAddresses();
    }
  }

  loadAddresses(): void {
    const api = 'http://localhost:3000/api';
    const token = this.session.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.loadingAddresses = true;
    this.http.get<any>(`${api}/users/addresses`, { headers }).subscribe({
      next: (res) => {
        this.addresses = Array.isArray(res) ? res : (res && res.addresses) ? res.addresses : [];
        this.loadingAddresses = false;
      },
      error: (err) => {
        console.error('Failed to load addresses', err);
        this.addresses = [];
        this.loadingAddresses = false;
        this.addressesError = 'Impossibile caricare indirizzi salvati';
      }
    });
  }

  selectAddress(addr: any): void {
    if (!addr) return;
    this.delivery.fullName = addr.fullName || addr.name || '';
    this.delivery.address = addr.address || addr.street || '';
    this.delivery.city = addr.city || '';
    this.delivery.postalCode = addr.postalCode || addr.zip || '';
    this.delivery.phone = addr.phone || '';
    this.showAddresses = false;
  }

  saveAddress(): void {
    if (!this.auth.isAuthenticated()) {
      this.addressesError = 'Devi essere loggato per salvare un indirizzo';
      return;
    }
    // basic validation
    if (!this.delivery.address || !this.delivery.city) {
      this.addressesError = 'Compila almeno indirizzo e città prima di salvare';
      return;
    }
    this.addressesError = null;
    this.addressesSuccess = null;
    this.savingAddress = true;
    const api = 'http://localhost:3000/api';
    const token = this.session.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const payload = {
      fullName: this.delivery.fullName,
      address: this.delivery.address,
      city: this.delivery.city,
      postalCode: this.delivery.postalCode,
      phone: this.delivery.phone
    };
    this.http.post<any>(`${api}/users/addresses`, payload, { headers }).subscribe({
      next: (created) => {
        // normalize and add to local list
        const item = {
          id: created && (created.id || created.id_ordine) ? (created.id || created.id_ordine) : undefined,
          fullName: created.fullName || created.nome_campanello || payload.fullName,
          address: created.address || created.indirizzo || payload.address,
          city: created.city || created.citta || payload.city,
          postalCode: created.postalCode || created.cap || payload.postalCode,
          phone: created.phone || created.telefono || payload.phone
        };
        // prepend so newest first
        this.addresses = [item, ...this.addresses];
        this.savingAddress = false;
        this.addressesSuccess = 'Indirizzo salvato con successo';
        // clear success after a short delay
        setTimeout(() => this.addressesSuccess = null, 3000);
      },
      error: (err) => {
        console.error('Failed to save address', err);
        this.addressesError = (err && err.error && err.error.message) ? err.error.message : 'Impossibile salvare indirizzo';
        this.savingAddress = false;
      }
    });
  }
}
