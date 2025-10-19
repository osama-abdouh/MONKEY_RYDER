// gestione della richiesta di login e token JWT
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/login';
  constructor(private http: HttpClient, private session: SessionService) {}

  login(email: string, password: string): Observable<{ token: string; user: any }> {
    return this.http.post<{ token: string; user: any }>(this.apiUrl, { email, password }).pipe(
      tap((response) => {
        if (response.token) {
          this.session.setToken(response.token); // Salva il token dopo login
          console.log('Token saved:', response.token); // Aggiungi questo per debug
        }
      })
    );
  }

  logout(): void {
    this.session.clearToken();
  }

  isAuthenticated(): boolean {
    return this.session.getToken() !== null;
  }
}
