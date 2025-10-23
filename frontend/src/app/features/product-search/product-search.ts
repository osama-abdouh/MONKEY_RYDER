import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-search.html',
  styleUrls: ['./product-search.css']
})
export class ProductSearch {
    searchProducts(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLElement;
    const formData = new FormData(form.closest('form') as HTMLFormElement);
    
    const searchData = {
      marca: formData.get('marca') as string,
      modello: formData.get('modello') as string,
      categoria: formData.get('categoria') as string
    };
    
    console.log('Ricerca prodotti con parametri:', searchData);
    
    // Qui puoi implementare la logica di ricerca
    // Ad esempio: chiamare un servizio API, filtrare i prodotti, ecc.
    alert(`Ricerca per: ${JSON.stringify(searchData, null, 2)}`);
  }

}
