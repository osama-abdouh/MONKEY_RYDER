import { Component } from '@angular/core';
import { Header } from '../../componenti/header/header';
import { Footer } from '../../componenti/footer/footer';
import { Search } from '../../componenti/search/search';

@Component({
  selector: 'app-cerca',
  imports: [Header, Footer, Search],
  templateUrl: './cerca.html',
  styleUrls: ['./cerca.css']
})
export class Cerca {

}
