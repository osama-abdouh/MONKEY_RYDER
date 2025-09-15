import { Routes } from '@angular/router';
<<<<<<< HEAD
import { Home } from './pagine/home/home';
import { Cerca } from './pagine/cerca/cerca';
import { Contattaci } from './pagine/contattaci/contattaci';
import { SplashPage } from './pagine/splashPage/splashPage';
import {Policy} from "./pagine/policy/policy";

export const routes: Routes = [
  { path: '', component: SplashPage },
  { path: 'home', component: Home },
  { path: 'cerca', component: Cerca },
  { path: 'contattaci', component: Contattaci },
  { path: 'policy', component: Policy }
=======
import { HomeComponent } from './features/home/home';
import { CartComponent } from './features/cart/cart';
import { RegisterComponent } from './features/auth/register/register';
import { WishlistComponent } from './features/wishlist/wishlist';
import { ContactUsComponent } from './features/contact-us/contact-us';
import { SplashComponent } from './features/splash/splash';


export const routes: Routes = [
    { path: '', component: SplashComponent }, // Splash page come pagina principale
    { path: 'home', component: HomeComponent }, // Home accessibile dopo la splash
    { path: 'cart', component: CartComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'wishlist', component: WishlistComponent },
    { path: 'contact-us', component: ContactUsComponent },
    { path: '**', redirectTo: '' } // Rotta di fallback per URL non validi
>>>>>>> 025a782116520e57b9576adfa264847de08dead9
];
