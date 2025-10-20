import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WishlistService } from './wishlist.service';

@Injectable({
  providedIn: 'root',
})
export class WishlistManagerService {
  private wishlistProductIds = new BehaviorSubject<Set<number>>(new Set());
  public wishlistProductIds$ = this.wishlistProductIds.asObservable();

  constructor(private wishlistService: WishlistService) {
    this.loadWishlistIds();
  }

  private loadWishlistIds() {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        const ids = new Set(wishlist.map((p) => p.id));
        this.wishlistProductIds.next(ids);
      },
      error: (err) => {
        console.error('Errore caricamento wishlist', err);
      },
    });
  }

  addToWishlist(productId: number): Observable<any> {
    return new Observable((observer) => {
      this.wishlistService.addProduct(productId).subscribe({
        next: (response) => {
          // Aggiorna lo stato locale
          const currentIds = this.wishlistProductIds.value;
          currentIds.add(productId);
          this.wishlistProductIds.next(new Set(currentIds));

          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          if (err.status === 409) {
            // Prodotto già presente, aggiorna comunque lo stato
            const currentIds = this.wishlistProductIds.value;
            currentIds.add(productId);
            this.wishlistProductIds.next(new Set(currentIds));
          }
          observer.error(err);
        },
      });
    });
  }

  removeFromWishlist(productId: number): Observable<any> {
    return new Observable((observer) => {
      this.wishlistService.removeProduct(productId).subscribe({
        next: (response) => {
          // Aggiorna lo stato locale
          const currentIds = this.wishlistProductIds.value;
          currentIds.delete(productId);
          this.wishlistProductIds.next(new Set(currentIds));

          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistProductIds.value.has(productId);
  }

  toggleWishlist(productId: number): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }
}
