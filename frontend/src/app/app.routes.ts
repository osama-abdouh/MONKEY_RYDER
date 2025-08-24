import { Routes } from '@angular/router';
import { Home } from './pagine/home/home';
import { Search } from './componenti/search/search';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'search', component: Search }
 
];
