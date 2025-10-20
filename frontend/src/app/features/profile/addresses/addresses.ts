import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css'
})
export class AddressesComponent implements OnInit {
  addresses: Array<{ id: number; street: string; city: string; zip: string }> = [];

  ngOnInit() {
    // Fai fetch degli indirizzi dal backend e assegna a this.addresses
    this.addresses = [
      { id: 1, street: 'Via Roma 1', city: 'Roma', zip: '00100' },
      { id: 2, street: 'Corso Milano 12', city: 'Milano', zip: '20100' }
    ];
  }
}
