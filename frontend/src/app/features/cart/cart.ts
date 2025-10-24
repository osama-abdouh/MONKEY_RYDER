import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from './cart.service';
import { CommonModule, CurrencyPipe, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, NgIf, NgForOf, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private sub?: Subscription;

  constructor(private cartService: CartService, private auth: AuthService) {}

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
    // navigate to /checkout page instead of opening inline payment modal
    // navigation handled via routerLink on the template
  }
}