import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderDTO {
  id_ordine: number;
  user_id: number;
  prezzo: number;
  datas: string; // ISO date string
  first_name?: string;
  last_name?: string;
  email?: string;
  stato?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(`${this.apiUrl}/orders`);
  }

  getPendingOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(`${this.apiUrl}/orders/pending`);
  }

  cancelOrder(id_ordine: number): Observable<{ message: string; order?: { id_ordine: number; stato: string } }> {
    return this.http.patch<{ message: string; order?: { id_ordine: number; stato: string } }>(
      `${this.apiUrl}/orders/${id_ordine}/cancel`,
      {}
    );
  }
}
