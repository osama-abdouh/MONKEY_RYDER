import { Component } from '@angular/core';
import { Header } from '../../componenti/header/header';
import { Search } from "../../componenti/search/search";
import { Categoria } from "../../componenti/categoria/categoria";
import { Footer } from '../../componenti/footer/footer';


@Component({
  selector: 'app-home',
  imports: [Header, Search, Categoria, Footer],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  
}
