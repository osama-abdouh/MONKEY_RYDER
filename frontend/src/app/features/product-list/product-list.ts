import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../cart/cart.service';
import { Category } from '../home/categories/categories';
import { Brand } from '../../models/brand.model';
import { ProductItem } from '../../models/product.model';



@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductListComponent implements OnInit {
  products: ProductItem[] = [];
  filteredProducts: ProductItem[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  selectedCategory: string[] = [];
  selectedBrand: string[] = [];
  openDropdown: string | null = null;
  minPrice: number | null = null; // Prezzo minimo
  maxPrice: number | null = null; // Prezzo massimo
  loading = false;
  error = '';

  constructor(private http: HttpClient, private cartService: CartService) {}

  ngOnInit() {
    this.getAllProducts();
    this.getAllCategories();
    this.getAllBrands();
  }

  getAllProducts() {
    this.loading = true;
    this.error = '';

    this.http.get<ProductItem[]>('http://localhost:3000/api/products').subscribe({
      next: (data) => {
        this.products = data || [];
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento dei prodotti';
        this.loading = false;
        console.error('Errore:', err);
      },
    });
  }
  getAllCategories() {
    this.http.get<Category[]>('http://localhost:3000/api/categories').subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Errore nel caricamento delle categorie:', err);
      },
    });
  }
  getAllBrands() {
    this.http.get<Brand[]>('http://localhost:3000/api/brands').subscribe({
      next: (data) => {
        this.brands = data;
      },
      error: (err) => {
        console.error('Errore nel caricamenteo dei brand:', err);
      },
    });
  }

  toggleDropdown(dropdownName: string) {
    this.openDropdown = this.openDropdown === dropdownName ? null : dropdownName;
  }

  isDropdownOpen(dropdownName: string): boolean {
    return this.openDropdown === dropdownName;
  }

  // Filtri
  private applyFilters(): void {
    this.filteredProducts = this.products.filter((product) => {
      const meetsCategory =
        this.selectedCategory.length === 0 || this.selectedCategory.includes(product.category_name);
      const meetsMinPrice = this.minPrice === null || product.price >= this.minPrice;
      const meetsMaxPrice = this.maxPrice === null || product.price <= this.maxPrice;
      const meetsBrand =
        this.selectedBrand.length === 0 || this.selectedBrand.includes(product.brand_name);

      return meetsCategory && meetsMinPrice && meetsMaxPrice && meetsBrand;
    });
  }

  filterByPrice(): void {
    this.applyFilters();
    this.openDropdown = null;
  }

  filterByCategory(categoryName: string): void {
    this.selectedCategory = categoryName ? [categoryName] : [];
    this.openDropdown = null;
    this.applyFilters();
  }

  filterByBrand(brandName: string): void {
    if (brandName === 'Tutti') {
      this.selectedBrand = [];
    } else {
      if (this.selectedBrand.includes(brandName)) {
        this.selectedBrand = this.selectedBrand.filter((b) => b !== brandName);
      } else {
        this.selectedBrand.push(brandName);
      }
    }
    this.applyFilters();
  }

  addToCart(product: ProductItem) {
    this.cartService.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }
}
