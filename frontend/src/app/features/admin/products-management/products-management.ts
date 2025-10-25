import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
  brand_id: number;
  brand_name: string;
  image_path: string;
  quantity: number;
  sales_count?: number;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
}

export interface ShowcaseProduct {
  showcase_id: number;
  id: number;
  position: number;
  name: string;
  description: string;
  price: number;
  image_path: string;
  category_id: number;
  category_name: string;
  brand_id: number;
  brand_name: string;
}

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './products-management.html',
  styleUrl: './products-management.css',
})
export class ProductsManagementComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  searchTerm: string = '';

  // Gestione prodotti
  showCreate: boolean = false;
  newProduct: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    brand_id: 0,
    quantity: 0,
    image_path: '',
  };

  showDetails: boolean = false;
  selectedProduct: Product | null = null;
  isEditing: boolean = false;
  editedProduct: Product | null = null;

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  showcaseProducts: Set<number> = new Set();
  showcaseData: ShowcaseProduct[] = [];

  // Gestione categorie
  showCategoryManagement: boolean = false;
  showCreateCategory: boolean = false;
  newCategory: Partial<Category> = {
    name: '',
    image: '',
  };
  selectedCategoryImage: File | null = null;
  categoryImagePreview: string | null = null;

  // Gestione brand
  showBrandManagement: boolean = false;
  showCreateBrand: boolean = false;
  newBrand: Partial<Brand> = {
    name: '',
  };

  pageSize: number = 10;
  currentPage: number = 1;

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchProducts();
    this.fetchCategories();
    this.fetchBrands();
    this.fetchShowcaseProducts();
  }

  fetchProducts() {
    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento dei prodotti.';
        this.loading = false;
      },
    });
  }

  fetchCategories() {
    this.http.get<Category[]>(`${this.apiUrl}/categories`).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Errore caricamento categorie:', err);
      },
    });
  }

  fetchBrands() {
    this.http.get<Brand[]>(`${this.apiUrl}/brands`).subscribe({
      next: (data) => {
        this.brands = data;
      },
      error: (err) => {
        console.error('Errore caricamento brand:', err);
      },
    });
  }

  fetchShowcaseProducts() {
    this.http.get<ShowcaseProduct[]>(`${this.apiUrl}/showcase`).subscribe({
      next: (data) => {
        this.showcaseData = data;
        this.showcaseProducts = new Set(data.map((p) => p.id));
      },
      error: (err) => {
        console.error('Errore caricamento showcase:', err);
      },
    });
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.category_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.brand_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get displayedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // GESTIONE PRODOTTI
  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      brand_id: 0,
      quantity: 0,
      image_path: '',
    };
    this.selectedImage = null;
    this.imagePreview = null;
    this.error = null;
  }

  createProduct(): void {
    this.http.post<Product>(`${this.apiUrl}/products`, this.newProduct).subscribe({
      next: (data) => {
        if (this.selectedImage) {
          this.uploadProductImage(data.id, this.selectedImage);
        }
        this.fetchProducts();
        this.resetForm();
        this.showCreate = false;
        alert('Prodotto creato con successo!');
      },
      error: (err) => {
        this.error = 'Errore nella creazione del prodotto.';
      },
    });
  }

  toggleCreate(event: MouseEvent): void {
    this.showCreate = !this.showCreate;
    if (this.showCreate) {
      this.resetForm();
    }
  }

  toggleDetails(event: MouseEvent, product: Product): void {
    this.showDetails = !this.showDetails;
    this.isEditing = false;
    if (this.showDetails) {
      this.selectedProduct = { ...product };
    }
  }

  toggleEdit(event: MouseEvent, product: Product): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editedProduct = { ...product };
      this.imagePreview = this.getProductImageUrl(product);
    }
  }

  saveChanges(): void {
    if (!this.editedProduct || !this.selectedProduct) {
      this.error = 'Nessun prodotto selezionato per la modifica.';
      return;
    }

    const updateData = {
      name: this.editedProduct.name,
      description: this.editedProduct.description,
      price: this.editedProduct.price,
      category_id: this.editedProduct.category_id,
      brand_id: this.editedProduct.brand_id,
      quantity: this.editedProduct.quantity,
    };

    this.http.put(`${this.apiUrl}/products/${this.editedProduct.id}`, updateData).subscribe({
      next: (response: any) => {
        if (this.selectedImage && this.editedProduct) {
          this.uploadProductImage(this.editedProduct.id, this.selectedImage);
        }
        this.fetchProducts();
        this.selectedProduct = response.product || response;
        this.isEditing = false;
        this.selectedImage = null;
        this.imagePreview = null;
        alert('Prodotto aggiornato con successo!');
      },
      error: (err) => {
        alert(`Errore nell'aggiornamento del prodotto: ${err.message}`);
      },
    });
  }

  deleteProduct(product: Product): void {
    const confirmation = confirm(`Sei sicuro di voler eliminare il prodotto ${product.name}?`);
    if (!confirmation) {
      return;
    }

    this.http.delete(`${this.apiUrl}/products/${product.id}`).subscribe({
      next: () => {
        this.fetchProducts();
        alert('Prodotto eliminato con successo!');
      },
      error: (err) => {
        this.error = "Errore nell'eliminazione del prodotto.";
      },
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProductImage(productId: number, imageFile: File): void {
    const formData = new FormData();
    formData.append('image', imageFile);

    this.http.post(`${this.apiUrl}/products/${productId}/image`, formData).subscribe({
      next: (response: any) => {
        console.log('Immagine caricata con successo');
        this.fetchProducts();
      },
      error: (err) => {
        console.error("Errore nel caricamento dell'immagine:", err);
      },
    });
  }

  getProductImageUrl(product: Product): string {
    if (product.image_path) {
      return `http://localhost:3000/${product.image_path}`;
    }
    return 'assets/placeholder.png';
  }

  isInShowcase(productId: number): boolean {
    return this.showcaseProducts.has(productId);
  }

  toggleShowcase(product: Product): void {
    if (this.isInShowcase(product.id)) {
      this.removeFromShowcase(product.id);
    } else {
      this.addToShowcase(product.id);
    }
  }

  addToShowcase(productId: number): void {
    this.http.post(`${this.apiUrl}/showcase`, { productId }).subscribe({
      next: () => {
        this.fetchShowcaseProducts();
        alert('Prodotto aggiunto alla vetrina!');
      },
      error: (err) => {
        alert("Errore nell'aggiunta alla vetrina: " + err.error.message);
      },
    });
  }

  removeFromShowcase(productId: number): void {
    this.http.delete(`${this.apiUrl}/showcase/product/${productId}`).subscribe({
      next: () => {
        this.fetchShowcaseProducts();
        alert('Prodotto rimosso dalla vetrina!');
      },
      error: (err) => {
        alert('Errore nella rimozione dalla vetrina');
      },
    });
  }

  // GESTIONE CATEGORIE
  toggleCategoryManagement(): void {
    this.showCategoryManagement = !this.showCategoryManagement;
    this.showBrandManagement = false;
    this.showCreateCategory = false;
  }

  toggleCreateCategory(): void {
    this.showCreateCategory = !this.showCreateCategory;
    if (this.showCreateCategory) {
      this.newCategory = { name: '', image: '' };
      this.selectedCategoryImage = null;
      this.categoryImagePreview = null;
    }
  }

  onCategoryImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedCategoryImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.categoryImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  createCategory(): void {
    if (!this.newCategory.name) {
      alert('Inserisci un nome per la categoria');
      return;
    }

    this.http.post<Category>(`${this.apiUrl}/categories`, this.newCategory).subscribe({
      next: (data) => {
        if (this.selectedCategoryImage) {
          this.uploadCategoryImage(data.id, this.selectedCategoryImage);
        } else {
          this.fetchCategories();
          this.showCreateCategory = false;
          this.newCategory = { name: '', image: '' };
          this.categoryImagePreview = null;
          alert('Categoria creata con successo!');
        }
      },
      error: (err) => {
        alert('Errore nella creazione della categoria');
      },
    });
  }

  uploadCategoryImage(categoryId: number, imageFile: File): void {
    const formData = new FormData();
    formData.append('image', imageFile);

    this.http.post(`${this.apiUrl}/categories/${categoryId}/image`, formData).subscribe({
      next: (response: any) => {
        console.log('Immagine categoria caricata:', response);
        this.fetchCategories();
        this.showCreateCategory = false;
        this.newCategory = { name: '', image: '' };
        this.selectedCategoryImage = null;
        this.categoryImagePreview = null;
        alert('Categoria creata con successo!');
      },
      error: (err) => {
        console.error("Errore nel caricamento dell'immagine categoria:", err);
        console.error('Dettagli errore:', err.error);
        alert(
          'Categoria creata ma errore nel caricamento immagine: ' +
            (err.error?.details || err.message)
        );
        this.fetchCategories();
        this.showCreateCategory = false;
      },
    });
  }

  getCategoryImageUrl(category: Category): string {
    console.log('Category:', category);
    console.log('Category image:', category.image);

    if (category.image) {
      const url = `http://localhost:3000/${category.image}`;
      console.log('Category image URL:', url);
      return url;
    }
    return 'assets/placeholder.png';
  }

  deleteCategory(category: Category): void {
    const confirmation = confirm(`Sei sicuro di voler eliminare la categoria ${category.name}?`);
    if (!confirmation) {
      return;
    }

    this.http.delete(`${this.apiUrl}/categories/${category.id}`).subscribe({
      next: () => {
        this.fetchCategories();
        alert('Categoria eliminata con successo!');
      },
      error: (err) => {
        alert(
          'Errore: impossibile eliminare la categoria. Potrebbe essere in uso da alcuni prodotti.'
        );
      },
    });
  }

  // GESTIONE BRAND
  toggleBrandManagement(): void {
    this.showBrandManagement = !this.showBrandManagement;
    this.showCategoryManagement = false;
    this.showCreateBrand = false;
  }

  toggleCreateBrand(): void {
    this.showCreateBrand = !this.showCreateBrand;
    if (this.showCreateBrand) {
      this.newBrand = { name: '' };
    }
  }

  createBrand(): void {
    if (!this.newBrand.name) {
      alert('Inserisci un nome per il brand');
      return;
    }

    this.http.post<Brand>(`${this.apiUrl}/brands`, this.newBrand).subscribe({
      next: (data) => {
        this.fetchBrands();
        this.showCreateBrand = false;
        this.newBrand = { name: '' };
        alert('Brand creato con successo!');
      },
      error: (err) => {
        alert('Errore nella creazione del brand');
      },
    });
  }

  deleteBrand(brand: Brand): void {
    const confirmation = confirm(`Sei sicuro di voler eliminare il brand ${brand.name}?`);
    if (!confirmation) {
      return;
    }

    this.http.delete(`${this.apiUrl}/brands/${brand.id}`).subscribe({
      next: () => {
        this.fetchBrands();
        alert('Brand eliminato con successo!');
      },
      error: (err) => {
        alert('Errore: impossibile eliminare il brand. Potrebbe essere in uso da alcuni prodotti.');
      },
    });
  }
}
