import { Component } from '@angular/core';
import { ProductSearch } from '../product-search/product-search';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductSearch],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  onImageError(event: any): void {
    console.error('Errore caricamento immagine:', event.target.src);
    event.target.src = 'https://via.placeholder.com/60x60/e74c3c/ffffff?text=ERR';
  }
}
