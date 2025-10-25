import { Component, OnInit } from '@angular/core';
import { OrderService, OrderDTO } from '../../../services/order.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './orders-management.html',
  styleUrl: './orders-management.css',
})
export class OrdersManagementComponent {
  loading: boolean = true;
  error: string | null = '';
  orders: OrderDTO[] = [];
  allOrders: OrderDTO[] = [];

  statusOrder: string[] = [
    'pending',
    'ricevuto',
    'in preparazione',
    'spedito',
    'in transito',
    'in consegna',
    'consegnato',
  ];

  constructor(private orderService: OrderService) {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getAllOrders().subscribe({
      next: (data: OrderDTO[]) => {
        this.orders = data;
        this.allOrders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento degli ordini:', err);
        this.error = 'Errore nel caricamento degli ordini.';
        this.loading = false;
      },
    });
  }


  advanceStatus(order: OrderDTO): void {
    const currentStatus = (order.stato_pacco_latest || order.stato || 'pending').toLowerCase();
    const currentIndex = this.statusOrder.findIndex(
      (s) => currentStatus.includes(s) || s.includes(currentStatus)
    );

    if (currentIndex === -1) {
      alert('Stato attuale non riconosciuto');
      return;
    }

    if (currentIndex >= this.statusOrder.length - 1) {
      alert("L'ordine è già nello stato finale (consegnato)");
      return;
    }

    const nextStatus = this.statusOrder[currentIndex + 1];

    // Richiedi la località tramite prompt
    const localita = prompt(
      `Vuoi avanzare l'ordine #${order.id_ordine} da "${this.statusOrder[currentIndex]}" a "${nextStatus}"?\n\nInserisci la località:`,
      'Centro logistico'
    );

    // Se l'utente annulla il prompt, localita sarà null
    if (localita === null) return;

    // Se l'utente non inserisce nulla, usa un valore di default
    const locationToSend = localita.trim() || 'Centro logistico';

    this.orderService.advanceOrderStatus(order.id_ordine, locationToSend).subscribe({
      next: (response) => {
        console.log('Stato aggiornato:', response);
        this.fetchOrders();
        alert(`Ordine #${order.id_ordine} avanzato a: ${nextStatus}\nLocalità: ${locationToSend}`);
      },
      error: (err) => {
        console.error("Errore nell'avanzamento dello stato:", err);
        alert("Errore nell'aggiornamento dello stato dell'ordine");
      },
    });
  }

  canAdvance(order: OrderDTO): boolean {
    const currentStatus = (order.stato_pacco_latest || order.stato || '').toLowerCase();
    return (
      !currentStatus.includes('consegnato') &&
      !currentStatus.includes('annullato') &&
      !currentStatus.includes('cancelled')
    );
  }
}
