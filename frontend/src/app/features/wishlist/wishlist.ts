import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../cart/cart.service';
import { ProductItem } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule, RouterModule],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.css'],
})
export class WishlistComponent implements OnInit {
  wishlist: ProductItem[] = [];
  loading: boolean = false;
  error = '';
  productIdToAdd: number | null = null;

  constructor(private wishlistService: WishlistService, private cartService: CartService) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.error = '';

    this.wishlistService.getWishlist().subscribe({
      next: (products) => {
        this.wishlist = products;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento della wishlist';
        this.loading = false;
        console.error('Wishlist error:', err);
      },
    });
  }

  addToWishlist(): void {
    if (!this.productIdToAdd) {
      this.error = 'Inserisci un ID prodotto valido';
      return;
    }

    this.loading = true;
    this.error = '';

    this.wishlistService.addProduct(this.productIdToAdd).subscribe({
      next: () => {
        this.productIdToAdd = null;
        this.loadWishlist();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.error = 'Prodotto già presente nella wishlist';
        } else {
          this.error = "Errore nell'aggiunta del prodotto";
        }
        console.error('Add to wishlist error:', err);
      },
    });
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeProduct(productId).subscribe({
      next: () => {
        this.wishlist = this.wishlist.filter((p) => p.id !== productId);
      },
      error: (err) => {
        this.error = 'Errore nella rimozione del prodotto';
        console.error('Remove from wishlist error:', err);
      },
    });
  }

  clearError(): void {
    this.error = '';
  }

  getImageUrl(item: ProductItem | any): string {
    if (!item) return 'assets/images/no-image.png';
    const candidates = [item.image, item.image_path, item.product_image, item.product_image_path, item.imageUrl];
    for (const c of candidates) {
      if (c && String(c).trim()) {
        const s = String(c).trim();
        if (/^https?:\/\//i.test(s)) return s;
        return `http://localhost:3000/${s}`;
      }
    }
    return 'assets/images/no-image.png';
  }

  onImageError(ev: Event): void {
    try { const img = ev.target as HTMLImageElement; if (img) img.src = 'assets/images/no-image.png'; } catch(e){}
  }

  addToCart(item: ProductItem | any): void {
    if (!item || !item.id) {
      this.error = 'Prodotto non valido';
      return;
    }

    try {
      // normalize price: accept number or numeric string (with , or .), strip currency symbols
      const rawPrice = item && (item.price ?? item.prezzo ?? 0);
      let priceNum = 0;
      try {
        if (typeof rawPrice === 'number') priceNum = rawPrice;
        else if (typeof rawPrice === 'string') {
          // remove any non-digit, non-dot, non-comma, non-minus characters
          const cleaned = rawPrice.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
          priceNum = parseFloat(cleaned) || 0;
        } else {
          priceNum = Number(rawPrice) || 0;
        }
      } catch (e) {
        priceNum = 0;
      }

      this.cartService.add({
        productId: item.id,
        name: item.name || item.title || 'Prodotto',
        price: priceNum,
        quantity: 1,
        // include the full product object so cart consumers have access to all data
        product: item,
      });
      // remove from wishlist after adding to cart
      this.removeFromWishlist(item.id);
      // small confirmation for the user
      alert('Prodotto aggiunto al carrello');
    } catch (e) {
      console.error('Errore aggiunta al carrello', e);
      this.error = 'Impossibile aggiungere il prodotto al carrello';
    }
  }

  clearWishlist(): void {
    // if service exposes a clear method, call it; otherwise clear locally
    if (this.wishlistService && typeof (this.wishlistService as any).clear === 'function') {
      (this.wishlistService as any).clear().subscribe({ next: () => { this.wishlist = []; }, error: () => { this.wishlist = []; } });
    } else {
      this.wishlist = [];
    }
  }
}
