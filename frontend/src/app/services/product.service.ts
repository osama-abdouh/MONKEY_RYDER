import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeastProduct {
  id: number;
  name: string;
  category: string;
  quantity: number | null;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getLeastStock(): Observable<LeastProduct | null> {
    return this.http.get<LeastProduct | null>(`${this.apiUrl}/products/count-less`);
  }
}
