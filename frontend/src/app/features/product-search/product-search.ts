import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-search.html',
  styleUrls: ['./product-search.css']
})
export class ProductSearch {
  modelsByBrand: Record<string, string[]> = {
    audi: ['A3'],
    bmw: ['M4'],
    fiat: ['Panda'],
    ford: ['Puma'],
    mercedes: ['C-Class'],
    volkswagen: ['Golf']
  };

  modelOptions: string[] = [];

  vehicleMap: Record<string, number> = {
    'audi|a3': 1,
    'bmw|m4': 2,
    'fiat|panda': 3,
    'ford|puma': 4,
    'mercedes|c-class': 5,
    'volkswagen|golf': 6
  };

  constructor(private router: Router) {
    this.modelOptions = [];
  }

  onMarcaChange(evtOrValue: any) {
    let brandValue = '';
    if (typeof evtOrValue === 'string') brandValue = evtOrValue;
    else if (evtOrValue && evtOrValue.target) brandValue = (evtOrValue.target as HTMLSelectElement).value;
    const key = (brandValue || '').toLowerCase();
    this.modelOptions = this.modelsByBrand[key] ? [...this.modelsByBrand[key]] : [];
  }

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

    const brandKey = (searchData.marca || '').toLowerCase();
    const modelKey = (searchData.modello || '').toLowerCase();
    const mapKey = `${brandKey}|${modelKey}`;
    const vehicleId = this.vehicleMap[mapKey];

    if (vehicleId) {
      this.router.navigate(['/product-list'], { queryParams: { vehicleId } });
      return;
    }

    // fallback: navigate to product-list with generic search param
    this.router.navigate(['/product-list'], { queryParams: { search: searchData.marca || '' } });
  }

}
