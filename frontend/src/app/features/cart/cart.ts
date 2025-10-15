import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from './cart.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private sub?: Subscription;

  constructor(private cartService: CartService, private auth: AuthService, private http: HttpClient, private session: SessionService) {}

  ngOnInit(): void {
    this.sub = this.cartService.cart$.subscribe((items: CartItem[]) => this.cartItems = items);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  increase(item: CartItem) {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
  }

  decrease(item: CartItem) {
    const q = item.quantity - 1;
    if (q <= 0) this.cartService.remove(item.productId);
    else this.cartService.updateQuantity(item.productId, q);
  }

  remove(item: CartItem) {
    this.cartService.remove(item.productId);
  }

  clear() {
    this.cartService.clear();
  }

  getTotalItems(): number {
    return this.cartService.getTotalItems();
  }

  getTotalPrice(): number {
    return this.cartService.getTotalPrice();
  }

  get isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }

  checkout(): void {
    if (!this.isLoggedIn) return;
    this.paymentError = null;
    this.showPayment = true;
  }

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
          payment_ref: 'MOCK-' + Date.now()
        }, { headers }).subscribe({
          next: () => {
            this.paying = false;
            this.showPayment = false;
            alert('Pagamento confermato');
            this.clear();
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
}