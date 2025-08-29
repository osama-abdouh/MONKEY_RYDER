import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { CartComponent } from './features/cart/cart';
import { RegisterComponent } from './features/auth/register/register';
import { WishlistComponent } from './features/wishlist/wishlist';


export const routes: Routes = [
    { path: '', component: HomeComponent }, // Rotta principale
    { path: 'cart', component: CartComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'wishlist', component: WishlistComponent },
    { path: '**', redirectTo: '' } // Rotta di fallback per URL non validi
];
