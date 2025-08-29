import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Api {
  private baseUrl = 'http://localhost:3000/api'; // URL del backend

  constructor(private http: HttpClient) {}

  // Metodo per controllare lo stato del server
  getHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}
