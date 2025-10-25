// gestione della richiesta di login e token JWT
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from './session.service';
import { User } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  public isAdmin$ = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient, private session: SessionService) {
    // inizializza lo stato admin se token già presente
    if (this.session.getToken()) {
      this.checkAdmin().subscribe();
    }
  }

  login(email: string, password: string): Observable<{ token: string; user: any }> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response.token) {
          this.session.setToken(response.token); // Salva il token dopo login
          console.log('Token saved:', response.token); // Aggiungi questo per debug
          // aggiorna lo stato admin dopo il login
          this.checkAdmin().subscribe({ next: (v) => this.isAdmin$.next(v), error: () => this.isAdmin$.next(false) });
        }
      })
    );
  }

  register(userData: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    this.session.clearToken();
    this.isAdmin$.next(false);
  }

  isAuthenticated(): boolean {
    const token = this.session.getToken();

    if (!token) {
      return false;
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return now >= exp;
    } catch (e) {
      return true;
    }
  }
  getUserRole(): string | null {
    const token = this.session.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      return null;
    }
  }






  // helper che chiama backend /is-admin e aggiorna stream
  checkAdmin(): Observable<boolean> {
    const token = this.session.getToken();
    if (!token) return of(false);
    const headers = { Authorization: `Bearer ${token}` } as any;
    return this.http.get<{ isAdmin: boolean }>(`${this.apiUrl}/is-admin`, { headers }).pipe(
      map((resp) => {
        const isAdmin = !!(resp && resp.isAdmin);
        this.isAdmin$.next(isAdmin);
        return isAdmin;
      })
    );
  }

  // Cambia password per l'utente autenticato
  changePassword(oldPassword: string, newPassword: string) {
    const token = this.session.getToken();
    if (!token) throw new Error('Not authenticated');
    const headers = { Authorization: `Bearer ${token}` } as any;
    return this.http.post(`${this.apiUrl}/change-password`, { oldPassword, newPassword }, { headers });
  }
}
