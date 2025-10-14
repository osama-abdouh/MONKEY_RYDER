import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Category, Product, DbColumn } from '../../../services/product.service';

@Component({
  selector: 'app-lowest-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lowest-stock.html',
  styleUrl: './lowest-stock.css'
})
export class LowestStock implements OnInit {
  @Input() incomingProduct: any = null;

  // data
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  products: Product[] = [];

  // ui state
  loadingCategories = false;
  loadingProducts = false;
  errorCategories = '';
  errorProducts = '';

  // create category modal state
  showCreateModal = false;
  loadingCreate = false;
  createError = '';
  categoryColumns: DbColumn[] = [];
  categoryForm: Record<string, any> = {};

  // add product modal state
  showAddProductModal = false;
  loadingAddProduct = false;
  addProductError = '';
  productColumns: DbColumn[] = [];
  productForm: Record<string, any> = {};

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    this.loadingCategories = true;
    this.errorCategories = '';
    this.productService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.loadingCategories = false;
      },
      error: (err) => {
        this.errorCategories = 'Errore nel caricamento delle categorie';
        this.loadingCategories = false;
        console.error('Categorie error:', err);
      }
    });
  }

  selectCategory(cat: Category) {
    // toggle open/close if clicking again
    if (this.selectedCategory && this.selectedCategory.id === cat.id) {
      this.selectedCategory = null;
      this.products = [];
      return;
    }

    this.selectedCategory = cat;
    this.loadProductsForCategory(cat);
  }

  private loadProductsForCategory(cat: Category) {
    this.loadingProducts = true;
    this.errorProducts = '';
    this.products = [];
    this.productService.getProductsByCategoryId(cat.id).subscribe({
      next: (prods) => {
        this.products = prods || [];
        this.loadingProducts = false;
      },
      error: (err) => {
        this.errorProducts = 'Errore nel caricamento dei prodotti';
        this.loadingProducts = false;
        console.error('Prodotti error:', err);
      }
    });
  }

  // helper to format numbers as currency
  formatCurrency(v: any): string {
    if (v === null || v === undefined) return '-';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
  }

  // Actions toolbar handlers (placeholders)
  onCreateCategory() {
    this.showCreateModal = true;
    this.loadingCreate = true;
    this.createError = '';
    this.categoryColumns = [];
    this.categoryForm = {};

    this.productService.getDbStructure().subscribe({
      next: (columns) => {
        // filter only categories table
        const catCols = (columns || []).filter(
          (c) => c.table_name && c.table_name.toLowerCase() === 'categories'
        );
        // exclude typical auto/metadata columns
        const exclude = new Set(['id', 'created_at', 'updated_at']);
        this.categoryColumns = catCols.filter(
          (c) => !exclude.has(c.column_name?.toLowerCase() || '')
        );
        // init form model
        for (const col of this.categoryColumns) {
          const t = this.inputTypeFor(col);
          this.categoryForm[col.column_name] = t === 'checkbox' ? false : '';
        }
        this.loadingCreate = false;
      },
      error: (err) => {
        this.createError = 'Errore nel recupero struttura DB';
        console.error('DB structure error:', err);
        this.loadingCreate = false;
      }
    });
  }

  onDeleteCategory() {
    if (!this.selectedCategory) {
      alert('Seleziona prima una categoria da eliminare.');
      return;
    }
    const confirmDelete = confirm(`Eliminare la categoria "${this.selectedCategory.name}"?`);
    if (!confirmDelete) return;

    const id = this.selectedCategory.id;
    this.loadingCategories = true;
    this.productService.deleteCategory(id).subscribe({
      next: () => {
        // clear selection, refresh list
        this.selectedCategory = null;
        this.products = [];
        this.fetchCategories();
      },
      error: (err) => {
        this.loadingCategories = false;
        alert('Errore durante l\'eliminazione della categoria');
        console.error('Delete category error:', err);
      }
    });
  }

  onAddProduct() {
    if (!this.selectedCategory) {
      alert('Seleziona una categoria prima di aggiungere un prodotto.');
      return;
    }
    this.showAddProductModal = true;
    this.loadingAddProduct = true;
    this.addProductError = '';
    this.productColumns = [];
    this.productForm = {};

    this.productService.getDbStructure().subscribe({
      next: (columns) => {
        const prodCols = (columns || []).filter(
          (c) => c.table_name && c.table_name.toLowerCase() === 'products'
        );
        const exclude = new Set(['id', 'created_at', 'updated_at']);
        this.productColumns = prodCols.filter(
          (c) => !exclude.has(c.column_name?.toLowerCase() || '')
        );
        // init form and prefill category_id if present
        for (const col of this.productColumns) {
          const t = this.inputTypeFor(col);
          if (col.column_name === 'category_id') {
            this.productForm[col.column_name] = this.selectedCategory?.id ?? '';
          } else {
            this.productForm[col.column_name] = t === 'checkbox' ? false : '';
          }
        }
        this.loadingAddProduct = false;
      },
      error: (err) => {
        this.addProductError = 'Errore nel recupero struttura DB';
        console.error('DB structure error (products):', err);
        this.loadingAddProduct = false;
      }
    });
  }

  closeAddProductModal() {
    this.showAddProductModal = false;
  }

  submitAddProduct() {
    this.loadingAddProduct = true;
    this.addProductError = '';
    const payload = { ...this.productForm };
    this.productService.createProduct(payload).subscribe({
      next: () => {
        this.loadingAddProduct = false;
        this.showAddProductModal = false;
        // refresh products for selected category
        if (this.selectedCategory) {
          this.loadProductsForCategory(this.selectedCategory);
        }
      },
      error: (err) => {
        this.loadingAddProduct = false;
        this.addProductError = 'Errore nel salvataggio del prodotto';
        console.error('Create product error:', err);
      }
    });
  }

  removeProduct(id: number) {
    if (!this.selectedCategory) return;
    const confirmDelete = confirm('Rimuovere questo prodotto?');
    if (!confirmDelete) return;
    this.loadingProducts = true;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.loadingProducts = false;
        this.loadProductsForCategory(this.selectedCategory!);
      },
      error: (err) => {
        this.loadingProducts = false;
        alert('Errore durante la rimozione del prodotto');
        console.error('Delete product error:', err);
      }
    });
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  submitCreateCategory() {
    this.loadingCreate = true;
    this.createError = '';
    const payload = { ...this.categoryForm };
    this.productService.createCategory(payload).subscribe({
      next: (created) => {
        this.loadingCreate = false;
        this.showCreateModal = false;
        // refresh categories and select the created one if present
        this.fetchCategories();
        if (created && created.id) {
          const found = this.categories.find(c => c.id === created.id);
          if (found) {
            this.selectCategory(found);
          }
        }
      },
      error: (err) => {
        this.loadingCreate = false;
        this.createError = 'Errore nel salvataggio della categoria';
        console.error('Create category error:', err);
      }
    });
  }

  inputTypeFor(col: DbColumn): 'text' | 'number' | 'checkbox' | 'date' {
    const t = (col.data_type || '').toLowerCase();
    if (t.includes('int') || t.includes('numeric') || t.includes('decimal')) return 'number';
    if (t.includes('bool')) return 'checkbox';
    if (t.includes('date')) return 'date';
    return 'text';
  }

}
