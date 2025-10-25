import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeastProduct {
  id: number;
  name: string;
  category: string;
  quantity: number | null;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
}

export interface DbColumn {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: 'YES' | 'NO';
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getLeastStock(): Observable<LeastProduct | null> {
    return this.http.get<LeastProduct | null>(`${this.apiUrl}/products/count-less`);
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getProductsByCategoryId(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/category/${categoryId}`);
  }

  getProductsByCategoryName(categoryName: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/category/name/${encodeURIComponent(categoryName)}`);
  }

  // Returns database structure (all tables/columns). We'll filter for 'categories'.
  getDbStructure(): Observable<DbColumn[]> {
    return this.http.get<DbColumn[]>(`${this.apiUrl}/db-structure`);
  }

  createCategory(payload: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, payload);
  }

  deleteCategory(id: number): Observable<{ success: boolean }>{
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/categories/${id}`);
  }

  createProduct(payload: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, payload);
  }

  deleteProduct(id: number): Observable<{ success: boolean }>{
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/products/${id}`);
  }

  getProductsByVehicle(vehicleId: number): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.apiUrl}/products/by-vehicle/${vehicleId}`);
}
}
