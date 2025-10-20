import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../services/wishlist.service';
import { ProductItem } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class WishlistComponent implements OnInit {
  wishlist: ProductItem[] = [];
  loading: boolean = false;
  error = '';
  productIdToAdd: number | null = null;

  constructor(private wishlistService: WishlistService) {}

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
}
