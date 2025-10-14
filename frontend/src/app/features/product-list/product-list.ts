import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CartService } from '../cart/cart.service';

interface ProductItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_name: string;
  altreInfo?: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
  products: ProductItem[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient, private cartService: CartService) {}

  ngOnInit() {
    this.getAllProducts();
  }

  getAllProducts() {
    this.loading = true;
    this.error = '';

    this.http.get<ProductItem[]>('http://localhost:3000/api/products').subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento dei prodotti';
        this.loading = false;
        console.error('Errore:', err);
      }
    });
  }

  addToCart(product: ProductItem) {
    this.cartService.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
}
