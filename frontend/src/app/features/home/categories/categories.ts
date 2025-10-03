import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  backendUrl = 'http://localhost:3000'; // URL del tuo backend

  constructor(private http: HttpClient) {}

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
        // Potresti mostrare un messaggio di errore invece
      }
    });
  }

  onCategoryClick(category: Category) {
    // Naviga alla lista prodotti per categoria
    console.log('Categoria selezionata:', category);
    // Puoi aggiungere la navigazione qui, ad esempio:
    // this.router.navigate(['/products', 'category', category.id]);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.log('Errore caricamento immagine:', target.src);
      // Temporaneamente commentato per debug
      // target.src = 'http://localhost:3000/images/Categorie/motore.jpg';
    }
  }
}