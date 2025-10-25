import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Category {
  id: number;
  name: string;
  image: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  backendUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.http.get<Category[]>(`${this.backendUrl}/api/categories`).subscribe({
      next: (data) => {
        this.categories = data;
        console.log('Categorie caricate:', data);
      },
      error: (error) => {
        console.error('Errore nel caricamento delle categorie:', error);
        this.categories = [];
      },
    });
  }

  getCategoryImageUrl(category: Category): string {
    console.log('Category:', category);
    console.log('Category image:', category.image);

    if (category.image) {
      const url = `${this.backendUrl}/${category.image}`;
      console.log('Category image URL:', url);
      return url;
    }
    return 'assets/images/placeholder.png';
  }

  onCategoryClick(category: Category) {
    console.log('Categoria selezionata:', category);
    this.router.navigate(['/product-list'], {
      queryParams: { categoryId: category.id, categoryName: category.name },
    });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.log('Errore caricamento immagine:', target.src);
      target.src = 'assets/images/placeholder.png';
    }
  }
}
