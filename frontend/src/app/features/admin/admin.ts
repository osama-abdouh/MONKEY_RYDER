import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent {
    menuItems = [
    { label: 'Utenti', icon: '👤', route: '/admin/users' },
    { label: 'Ordini', icon: '🛒', route: '/admin/orders' },
    { label: 'Prodotti', icon: '📦', route: '/admin/products' },
    { label: 'Coupon', icon: '🎟️', route: '/admin/coupons' }
  ];

  constructor(private router: Router) {}
}
