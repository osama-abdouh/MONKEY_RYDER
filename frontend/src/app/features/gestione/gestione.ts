import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { ProductService, LeastProduct } from '../../services/product.service';


@Component({
  selector: 'app-gestione',
  imports: [CommonModule, RouterModule],
  templateUrl: './gestione.html',
  styleUrls: ['./gestione.css']
})
export class Gestione implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  selected = false;
  // recentOrders kept as any[] and normalized before assigning to template
  recentOrders: any[] = [];
  maxOrderResult: { max_order: number, first_name: string, last_name: string } | undefined;
  leastProduct: LeastProduct | null = null;
  // quick action placeholders (no inputs)

  constructor(private userService: UserService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    // load only users with role 'customer'
    this.userService.getUsersByRole('customer').subscribe({
      next: (data) => { 
        this.users = data; 
        this.loading = false; 
        // if we have at least one user, load their recent orders to show in the Max Order box
        if (this.users && this.users.length) {
          const uid = (this.users[0] as any).id || (this.users[0] as any).user_id;
          if (uid) {
            this.userService.getRecentOrders(uid).subscribe({ 
              next: (orders) => { 
                // normalize each order into the fields the template expects: id_ordine, price, datas
                this.recentOrders = (orders || []).map((o: any) => ({
                  id_ordine: o.id_ordine || o.order_id || o.id,
                  price: o.price || o.prezzo,
                  datas: o.datas || o.data_ordine || o.date
                }));
              }, 
              error: (e) => { console.error('Failed to load recent orders', e); } 
            });
          } else {
            console.warn('Gestione: no user id found on first user, skipping recent orders load');
          }
        }
          // fetch least product for the UI box
          this.productService.getLeastStock().subscribe({
            next: (p) => { this.leastProduct = p; },
            error: (e) => { console.error('Failed to load least product', e); }
          });
      },
      error: (err) => { this.error = err.message || 'Failed to load users'; this.loading = false; console.error('Failed to load users', err); }
    });
  }

  onCardClick(): void {
    this.selected = !this.selected;
    console.log('Gestione card clicked, selected=', this.selected);
  }

  // placeholder for future least-product button action
  onLeastProductClick(): void {
    // intentionally empty for now
  }

  // Quick action placeholders
  onNewUser(): void {
    console.log('Placeholder: onNewUser clicked');
  }

  onDeleteOrder(): void {
    console.log('Placeholder: onDeleteOrder clicked');
  }

  onTrackOrder(): void {
    console.log('Placeholder: onTrackOrder clicked');
  }

  loadMaxOrder(): void {
    this.userService.getMaxOrder().subscribe({
      next: (data) => { this.maxOrderResult = data; },
      error: (err) => { console.error('Failed to load max order', err); this.maxOrderResult = undefined; }
    });
  }
}

