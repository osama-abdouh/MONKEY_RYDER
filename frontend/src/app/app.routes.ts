import { Routes } from '@angular/router';
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
];
