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
  payment_provider?: string;
  payment_ref?: string;
  payment_status?: string;
  stato_pacco_latest?: string;
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

  cancelOrder(
    id_ordine: number
  ): Observable<{ message: string; order?: { id_ordine: number; stato: string } }> {
    return this.http.patch<{ message: string; order?: { id_ordine: number; stato: string } }>(
      `${this.apiUrl}/orders/${id_ordine}/cancel`,
      {}
    );
  }

  // Ottiene gli ordini dell'utente autenticato. Se viene passato un token opzionale,
  // viene incluso nell'header Authorization come Bearer token.
  getMyOrders(token?: string): Observable<OrderDTO[]> {
    const url = `${this.apiUrl}/orders/mine`;
    if (token) {
      return this.http.get<OrderDTO[]>(url, {
        headers: { Authorization: `Bearer ${token}` } as any,
      });
    }
    return this.http.get<OrderDTO[]>(url);
  }

  // Ottiene i dettagli di un singolo ordine (order + items)
  getOrderDetails(orderId: number, token?: string): Observable<any> {
    const url = `${this.apiUrl}/orders/${orderId}`;
    if (token) {
      return this.http.get<any>(url, { headers: { Authorization: `Bearer ${token}` } as any });
    }
    return this.http.get<any>(url);
  }

  // Ottiene gli eventi di tracking per un ordine
  getOrderTracking(orderId: number, token?: string): Observable<any> {
    const url = `${this.apiUrl}/orders/${orderId}/tracking`;
    if (token) {
      return this.http.get<any>(url, { headers: { Authorization: `Bearer ${token}` } as any });
    }
    return this.http.get<any>(url);
  }
  // Avanza lo stato della consegna con località personalizzata
  advanceOrderStatus(id_ordine: number, localita?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/orders/${id_ordine}/advance-status`, {
      localita: localita || 'Centro logistico',
    });
  }
}
