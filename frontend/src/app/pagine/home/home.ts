import { Component } from '@angular/core';
import { Header } from '../../componenti/header/header';
import { Search } from "../../componenti/search/search";


@Component({
  selector: 'app-home',
  imports: [Header, Search],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  
}
