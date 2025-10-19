import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Aggiungi HttpParams
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../cart/cart.service';
import { Category } from '../home/categories/categories';
import { Brand } from '../../models/brand.model';
import { ProductItem } from '../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router'; // Aggiungi questi import

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
  searchTerm: string = ''; // Aggiungi questa proprietà
  currentSort: string = 'default';

  sortOptions = [
  { value: 'default', label: 'Predefinito' },
  { value: 'price-low', label: 'Prezzo: dal più basso' },
  { value: 'price-high', label: 'Prezzo: dal più alto' },
  { value: 'name-az', label: 'Nome: A-Z' },
  { value: 'name-za', label: 'Nome: Z-A' },
];

  // Oggetto con le funzioni di ordinamento
  private sortFunctions: { [key: string]: (a: ProductItem, b: ProductItem) => number } = {
    'price-low': (a, b) => a.price - b.price,
    'price-high': (a, b) => b.price - a.price,
    'name-az': (a, b) => a.name.localeCompare(b.name),
    'name-za': (a, b) => b.name.localeCompare(a.name),
  };

  loading = false;
  error = '';

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private route: ActivatedRoute, // Inietta ActivatedRoute
    private router: Router // Inietta Router
  ) {}

  ngOnInit() {

    // Leggi i parametri di query
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      
      console.log('Search term ricevuto:', this.searchTerm); // Debug
      
      // Carica categorie e brand
      this.getAllCategories();
      this.getAllBrands();
      
      // Se c'è un termine di ricerca, chiama la ricerca
      if (this.searchTerm.trim()) {
        this.searchProducts();
      } else {
        this.getAllProducts();
      }
    });
  }

  // Nuovo metodo per la ricerca dei prodotti
  searchProducts() {
    this.loading = true;
    this.error = '';
    
    let params = new HttpParams();
    params = params.set('search', this.searchTerm);
        
    // Usa l'URL corretto
    this.http.get<ProductItem[]>('http://localhost:3000/api/search', { params }).subscribe({
      next: (data) => {
        this.products = data || [];
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nella ricerca dei prodotti';
        this.loading = false;
      },
    });
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
  getProductImageUrl(product: ProductItem): string {
    console.log('Product:', product.name, 'Image path:', product.image_path); // Debug
    if (product.image_path) {
      return `http://localhost:3000/${product.image_path}`;
    }
    return 'assets/images/no-image.png'; // Percorso dell'immagine di default
  }
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/no-image.png';
  }

  toggleDropdown(dropdownName: string) {
    this.openDropdown = this.openDropdown === dropdownName ? null : dropdownName;
  }

  isDropdownOpen(dropdownName: string): boolean {
    return this.openDropdown === dropdownName;
  }

  // Ordinamento
  applySorting(sortType: string): void {
    this.currentSort = sortType;
    this.openDropdown = null;

    if (sortType === 'default') {
      this.applyFilters();
      return;
    }

    const sortFn = this.sortFunctions[sortType];
    if (sortFn) {
      this.filteredProducts = [...this.filteredProducts].sort(sortFn);
    }
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

    // Riapplica l'ordinamento se non è default
    if (this.currentSort !== 'default') {
      this.applySorting(this.currentSort);
    }
  }
  filterByPrice(): void {
    // Aggiorna i parametri dell'URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm || null,
        minPrice: this.minPrice || null,
        maxPrice: this.maxPrice || null,
      },
      queryParamsHandling: 'merge',
    });

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

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]);
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
