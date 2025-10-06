import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from './cart.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private sub?: Subscription;

  constructor(private cartService: CartService) {}

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
}