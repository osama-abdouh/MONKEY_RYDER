import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-colab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './colab.html',
  styleUrls: ['./colab.css']
})
export class ColabComponent {

  goToLink(url: string) 
    {
      window.open(url, '_blank');
    } 
}