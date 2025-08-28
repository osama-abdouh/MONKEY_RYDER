import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CartComponent } from './components/cart/cart';
import { RegisterComponent } from './components/register/register';
import { WishlistComponent } from './components/wishlist/wishlist';


export const routes: Routes = [
    { path: '', component: HomeComponent }, // Rotta principale
    { path: 'cart', component: CartComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'wishlist', component: WishlistComponent },
    { path: '**', redirectTo: '' } // Rotta di fallback per URL non validi
];
