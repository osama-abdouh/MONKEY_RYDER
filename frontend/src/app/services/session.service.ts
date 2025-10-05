import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  setToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  clearToken(): void {
    localStorage.removeItem('jwtToken');
  }
  
}
