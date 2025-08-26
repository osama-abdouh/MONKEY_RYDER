import { Component } from '@angular/core';

@Component({
  selector: 'app-colab',
  imports: [],
  templateUrl: './colab.html',
  styleUrl: './colab.css'
})
export class Colab {

  goToLink(url: string) 
    {
      window.open(url, '_blank');
    } 
}