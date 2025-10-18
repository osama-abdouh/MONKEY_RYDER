import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductItem } from '../models/product.model';

export interface ShowcaseProduct extends ProductItem {
  showcase_id: number;
  position: number;
}

@Injectable({
  providedIn: 'root', // Singleton - una sola istanza per tutta l'app
})
export class ShowcaseService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAllShowcaseProducts(): Observable<ShowcaseProduct[]> {
    return this.http.get<ShowcaseProduct[]>(`${this.apiUrl}/showcase`);
  }

  addProductToShowcase(productId: number, position?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/showcase`, { productId, position });
  }

  removeProductFromShowcase(showcaseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/showcase/${showcaseId}`);
  }
}
