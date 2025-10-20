import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { CartComponent } from './features/cart/cart';
import { Checkout } from './features/cart/checkout/checkout';
import { RegisterComponent } from './features/auth/register/register';
import { WishlistComponent } from './features/wishlist/wishlist';
import { ContactUsComponent } from './features/contact-us/contact-us';
import { SplashComponent } from './features/splash/splash';
import { ProfileComponent } from './features/profile/profile';
import { LoginComponent } from './features/auth/login/login';
import { ProductListComponent } from './features/product-list/product-list';
import { ProductDetailComponent } from './features/product-detail/product-detail';
import { Gestione } from './features/gestione/gestione';
import { Modifiche } from './features/modifiche/modifiche';
import { Orfini } from './features/orfini/orfini';


export const routes: Routes = [
    { path: '', component: SplashComponent }, // Splash page come pagina principale
    { path: 'home', component: HomeComponent }, // Home accessibile dopo la splash
    { path: 'cart', component: CartComponent },
    { path: 'checkout', component: Checkout },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'wishlist', component: WishlistComponent },
    { path: 'contact-us', component: ContactUsComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'product-list', component: ProductListComponent },

    { path: 'ordini', component: Orfini },

    { path: 'product/:id', component: ProductDetailComponent }, // Rotta per i dettagli del prodotto

    { path: 'gestione', component: Gestione },
    { path: 'modifiche', component: Modifiche },
    { path: '**', redirectTo: '' } // Rotta di fallback per URL non validi
];
