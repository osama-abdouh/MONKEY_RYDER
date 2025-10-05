import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  error: string | null = null;

  constructor(private authService: AuthService, private userService: UserService, private sessionService: SessionService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const token = this.sessionService.getToken();
    if (!token) {
      this.error = 'Token non trovato';
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      console.log('Decoded userId from token:', userId);

      if (!userId || isNaN(Number(userId))) {
        this.error = 'ID utente non valido nel token';
        return;
      }

      this.userService.getUserById(Number(userId)).subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (err) => {
          this.error = 'Errore nel caricamento del profilo';
          console.error('Error fetching user profile:', err);
        }
      });
    } catch (e) {
      this.error = 'Token non valido';
      console.error('Error decoding token:', e);
    }
  }
}
