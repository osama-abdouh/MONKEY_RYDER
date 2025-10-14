import { Component } from '@angular/core';

@Component({
  selector: 'app-colab',
  standalone: true,
  imports: [],
  templateUrl: './colab.html',
  styleUrl: './colab.css'
})
export class ColabComponent {

  goToLink(url: string) 
    {
      window.open(url, '_blank');
    } 
}