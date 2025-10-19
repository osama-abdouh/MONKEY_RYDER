import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProductItem } from '../../models/product.model';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  product: ProductItem | null = null;
  loading = false;
  error = '';
  stock: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.error = '';

    this.http.get<ProductItem>(`http://localhost:3000/api/products/${id}`).subscribe({
      next: (data) => {
        this.product = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento del prodotto';
        this.loading = false;
        console.error('Errore:', err);
      }
    });
  }

  getProductImageUrl(): string {
    if (this.product?.image_path) {
      return `http://localhost:3000/${this.product.image_path}`;
    }
    return 'assets/images/no-image.png';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/no-image.png';
  }

  increaseQuantity() {
    if (this.stock && this.product && this.stock < this.product.quantity) {
      this.stock++;
    }
  }

  decreaseQuantity() {
    if (this.stock > 1) {
      this.stock--;
    }
  }

  addToCart() {
    if (this.product) {
      this.cartService.add({
        productId: this.product.id,
        name: this.product.name,
        price: this.product.price,
        quantity: this.stock
      });
    }
  }

  goBack() {
    this.router.navigate(['/product-list']);
  }
}