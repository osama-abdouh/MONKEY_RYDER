// gestione della richiesta di login e token JWT
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  // stream pubblico per lo stato admin: Header e altri componenti possono sottoscriversi
  public isAdmin$ = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient, private session: SessionService) {
    // se c'è già un token al caricamento dell'app, prova a recuperare lo stato admin
    if (this.session.getToken()) {
      this.fetchAndSetAdmin();
    }
  }

  login(email: string, password: string): Observable<{ token: string; user: any }> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response.token) {
          this.session.setToken(response.token); // Salva il token dopo login
          console.log('Token saved:', response.token); // Aggiungi questo per debug
          // Aggiorna lo stato admin dopo il login
          this.fetchAndSetAdmin();
        }
      })
    );
  }

  logout(): void {
    this.session.clearToken();
    // al logout azzera lo stato admin così il pulsante scompare
    this.isAdmin$.next(false);
  }

  isAuthenticated(): boolean {
    return this.session.getToken() !== null;
  }

  // Chiama il backend per verificare se l'utente autenticato è admin
  isAdmin(): Observable<boolean> {
    const token = this.session.getToken();
    if (!token) return of(false);
    const headers = { Authorization: `Bearer ${token}` } as any;
    return this.http.get<{ isAdmin: boolean }>(`${this.apiUrl}/is-admin`, { headers }).pipe(
      map((resp) => !!(resp && resp.isAdmin)),
      tap((isAdmin) => console.log('isAdmin:', isAdmin))
    );
  }

  // helper che chiama isAdmin() e aggiorna il BehaviorSubject pubblico
  fetchAndSetAdmin(): void {
    this.isAdmin().subscribe({ next: (v) => this.isAdmin$.next(v), error: () => this.isAdmin$.next(false) });
  }
}
