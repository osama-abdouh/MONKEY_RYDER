import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  productId: number;
  name?: string;
  price?: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private storageKey = 'progetto_cart_v1';
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  private loadFromStorage(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]') as CartItem[];
    } catch {
      return [];
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cartSubject.value));
  }

  getItems(): CartItem[] {
    return [...this.cartSubject.value];
  }

  add(item: CartItem) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.productId === item.productId);
    if (idx >= 0) items[idx].quantity += item.quantity;
    else items.push({ ...item });
    this.cartSubject.next(items);
    this.saveToStorage();
  }

  updateQuantity(productId: number, quantity: number) {
    const items = this.getItems().map(i => i.productId === productId ? { ...i, quantity } : i);
    this.cartSubject.next(items);
    this.saveToStorage();
  }

  remove(productId: number) {
    const items = this.getItems().filter(i => i.productId !== productId);
    this.cartSubject.next(items);
    this.saveToStorage();
  }

  clear() {
    this.cartSubject.next([]);
    this.saveToStorage();
  }

  getTotalItems(): number {
    return this.getItems().reduce((s, i) => s + i.quantity, 0);
  }

  getTotalPrice(): number {
    return this.getItems().reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  }

  // se vogliamo sincronizare il carrello locale con il carrello dopo il login
  syncToServer(userId: number): Observable<any> {
    const payload = { userId, items: this.getItems() };
    return this.http.post('/api/cart/sync', payload);
  }
}
