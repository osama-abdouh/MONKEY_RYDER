import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { userGuard } from './guards/user-guard';
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
import { Orfini } from './features/orfini/orfini';
import { Traking } from './features/traking/traking';
import { AdminComponent } from './features/admin/admin';
import { UsersManagementComponent } from './features/admin/users-management/users-management';
import { OrdersManagementComponent } from './features/admin/orders-management/orders-management';
import { ProductsManagementComponent } from './features/admin/products-management/products-management';
import { CouponsManagementComponent } from './features/admin/coupons-management/coupons-management';
import { AccessDeniedComponent } from './features/acces-dennied/acces-dennied';

export const routes: Routes = [
    { path: '', component: SplashComponent }, // Splash page come pagina principale
    { path: 'home', component: HomeComponent }, // Home accessibile dopo la splash
    { path: 'cart', component: CartComponent },
    { path: 'checkout', component: Checkout },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'wishlist', canActivate: [userGuard], component: WishlistComponent },
    { path: 'contact-us', component: ContactUsComponent },
    { path: 'profile', canActivate: [userGuard], component: ProfileComponent },
    { path: 'product-list', component: ProductListComponent },
    { path: 'ordini', canActivate: [userGuard], component: Orfini },
    { path: 'traking/:id', canActivate: [userGuard], component: Traking },

    { path: 'product/:id', component: ProductDetailComponent }, // Rotta per i dettagli del prodotto
    { path: 'admin', canActivate: [adminGuard], component: AdminComponent , children: [
        { path: 'users', component: UsersManagementComponent },
        { path: 'orders', component: OrdersManagementComponent },
        { path: 'products', component: ProductsManagementComponent },
        { path: 'coupons', component: CouponsManagementComponent },
        { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]},
    { path: 'access-denied', component: AccessDeniedComponent },
    { path: '**', redirectTo: '' } // Rotta di fallback per URL non validi
];
