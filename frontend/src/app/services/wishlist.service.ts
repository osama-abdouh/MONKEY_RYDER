import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProductItem } from "../models/product.model";

@Injectable({ providedIn: "root" })
export class WishlistService {
  private apiUrl = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  getWishlist(): Observable<ProductItem[]> {
    return this.http.get<ProductItem[]>(`${this.apiUrl}/wishlist`);
  }

  addProduct(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/wishlist`, { productId });
  }

  removeProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${productId}`);
  }

  isInWishlist(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/wishlist/check/${productId}`);
  }
}