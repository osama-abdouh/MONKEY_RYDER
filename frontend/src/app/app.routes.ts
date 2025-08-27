import { Routes } from '@angular/router';
import { Home } from './pagine/home/home';
import { Search } from './componenti/search/search';
import { Contattaci } from './pagine/contattaci/contattaci';

import { SplashPage } from './pagine/splashPage/splashPage';

export const routes: Routes = [
  { path: '', component: SplashPage },
  { path: 'home', component: Home },
  { path: 'search', component: Search },
  { path: 'contattaci', component: Contattaci }
];
