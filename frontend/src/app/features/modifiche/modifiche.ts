import { Component } from '@angular/core';
import { ModificheUtenti } from './modifiche-utenti/modifiche-utenti';
import { HighestOrder } from './highest-order/highest-order';
import { LowestStock } from './lowest-stock/lowest-stock';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modifiche',
  standalone: true,
  imports: [CommonModule, ModificheUtenti, HighestOrder, LowestStock],
  templateUrl: './modifiche.html',
  styleUrls: ['./modifiche.css']
})
export class Modifiche {
  incomingMaxOrder: any = null;
  incomingLeastProduct: any = null;
  constructor(private router: Router) {}

  ngOnInit(): void {
    // read navigation state if present
    const nav = this.router.getCurrentNavigation();
    if (nav && nav.extras && (nav.extras as any).state) {
      const s = (nav.extras as any).state;
      this.incomingMaxOrder = s.fromGestioneMaxOrder || null;
      this.incomingLeastProduct = s.fromGestioneLeastProduct || null;
    } else if (typeof history !== 'undefined' && (history as any).state) {
      const s = (history as any).state;
      this.incomingMaxOrder = s.fromGestioneMaxOrder || null;
      this.incomingLeastProduct = s.fromGestioneLeastProduct || null;
    }
  }

}
