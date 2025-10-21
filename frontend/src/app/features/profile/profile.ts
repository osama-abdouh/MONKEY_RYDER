import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { PersonalDataComponent } from './personal-data/personal-data';
import { AddressesComponent } from './addresses/addresses';
import { Orfini } from '../orfini/orfini';
import { WishlistComponent } from '../wishlist/wishlist';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PersonalDataComponent, AddressesComponent, Orfini, WishlistComponent, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  error: string | null = null;
  currentView: 'personal' | 'addresses' | 'orders' | 'wishlist' = 'personal';

  constructor(private authService: AuthService, private userService: UserService, private sessionService: SessionService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadUserProfile();
    // check query params to open a specific view inside profile (e.g., ?view=wishlist or ?view=orders)
    this.route.queryParams.subscribe(params => {
      const v = params['view'];
      if (v === 'wishlist' || v === 'orders' || v === 'addresses' || v === 'personal') {
        this.currentView = v;
      }
    });
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

  selectView(view: 'personal' | 'addresses' | 'orders' | 'wishlist'): void {
    // show inline views inside the profile page instead of navigating away
    if (view === 'personal' || view === 'addresses' || view === 'orders' || view === 'wishlist') {
      this.currentView = view;
    }
  }

  logout(): void {
    this.authService.logout();
    // dopo logout, porta alla pagina principale (o login)
    this.router.navigate(['/']);
  }
}