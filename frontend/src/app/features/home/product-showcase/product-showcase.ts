import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowcaseService, ShowcaseProduct } from '../../../services/showcase.service';
import { CartService } from '../../cart/cart.service';


@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-showcase.html',
  styleUrl: './product-showcase.css',
})
export class ProductShowcase implements OnInit {
  products: ShowcaseProduct[] = [];
  currentIndex = 0;
  itemsPerPage = 4;
  isLoading = false;
  error: string | null = null;

  constructor(private showcaseService: ShowcaseService, private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadShowcaseProducts();
  }

  loadShowcaseProducts(): void {
    this.isLoading = true;
    this.error = null;

    this.showcaseService.getAllShowcaseProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento:', err);
        this.error = 'Impossibile caricare i prodotti.';
        this.isLoading = false;
      },
    });
  }

  get visibleProducts(): ShowcaseProduct[] {
    return this.products.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
  }

  get canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  get canGoForward(): boolean {
    return this.currentIndex + this.itemsPerPage < this.products.length;
  }

  goBack(): void {
    if (this.canGoBack) {
      this.currentIndex--;
    }
  }

  goForward(): void {
    if (this.canGoForward) {
      this.currentIndex++;
    }
  }
    getProductImageUrl(product: ShowcaseProduct): string {
      console.log('Product:', product.name, 'Image path:', product.image_path); // Debug
      if (product.image_path) {
        return `http://localhost:3000/${product.image_path}`;
      }
      return 'assets/images/no-image.png'; // Percorso dell'immagine di default
    }
    onImageError(event: Event): void {
      (event.target as HTMLImageElement).src = 'assets/images/no-image.png';
    }
      addToCart(product: ShowcaseProduct) {
        this.cartService.add({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });
      }
}
