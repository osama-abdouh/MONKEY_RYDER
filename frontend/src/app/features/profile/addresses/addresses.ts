import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule],
  templateUrl: './addresses.html',
  styleUrls: ['./addresses.css']
})
export class AddressesComponent implements OnInit {
  addresses: Array<any> = [];
  loading = false;
  error: string | null = null;
  selectedAddress: any = null;
  postalError: string | null = null;
  isPostalValid = true;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.loading = true;
    this.error = null;
    this.userService.getSavedAddresses().pipe(
      catchError(err => { this.error = err?.error?.message || err?.message || 'Errore nel caricare gli indirizzi'; this.loading = false; return of([]); })
    ).subscribe((list: any[]) => {
      this.loading = false;
      this.addresses = list || [];
    });
  }

  selectAddress(addr: any) {
    this.selectedAddress = addr;
    console.log('Selected address', addr);
    // placeholder: you can emit an event or navigate to a details view
  }

  saveEditedAddress() {
    if (!this.selectedAddress) return;
    // client-side postal code validation
    if (!this.validatePostal(this.selectedAddress.postalCode)) {
      this.postalError = 'CAP invalido: deve contenere esattamente 5 cifre';
      this.isPostalValid = false;
      return;
    }
    this.postalError = null;
    this.isPostalValid = true;
    const payload: any = {
      label: this.selectedAddress.fullName,
      address: this.selectedAddress.address,
      city: this.selectedAddress.city,
      postal_code: this.selectedAddress.postalCode,
      phone: this.selectedAddress.phone
    };
    const request$ = this.selectedAddress && this.selectedAddress.id ? this.userService.updateAddress(this.selectedAddress.id, payload) : this.userService.saveAddress(payload);

    request$.pipe(
      catchError(err => { this.error = err?.error?.message || err?.message || 'Errore durante il salvataggio'; return of(null); })
    ).subscribe(res => {
      if (res) {
        // refresh list and clear selection
        this.loadAddresses();
        this.selectedAddress = null;
      }
    });
  }

  cancelEdit() {
    this.selectedAddress = null;
    this.error = null;
    this.postalError = null;
    this.isPostalValid = true;
  }

  addNewAddress() {
    this.selectedAddress = { id: null, fullName: '', address: '', city: '', postalCode: '', phone: '' };
    this.error = null;
    this.postalError = null;
    this.isPostalValid = true;
    // focus handled elsewhere if needed
  }

  onPostalChange(value: any) {
    this.selectedAddress.postalCode = value;
    if (!this.validatePostal(value)) {
      this.postalError = 'CAP invalido: deve contenere esattamente 5 cifre';
      this.isPostalValid = false;
    } else {
      this.postalError = null;
      this.isPostalValid = true;
    }
  }

  // Confirm and delete an address
  confirmDelete(addr: any) {
    if (!addr) return;
    const ok = confirm('Sei sicuro di voler eliminare questo indirizzo? Questa operazione non è reversibile.');
    if (!ok) return;

    // call service to delete and refresh list on success
    this.userService.deleteAddress(addr.id).pipe(
      catchError(err => { this.error = err?.error?.message || err?.message || 'Errore durante la cancellazione'; return of(null); })
    ).subscribe((res: any) => {
      if (res !== null) {
        // refresh addresses
        this.loadAddresses();
        // if the deleted address was selected, clear selection
        if (this.selectedAddress && this.selectedAddress.id === addr.id) {
          this.selectedAddress = null;
        }
      }
    });
  }

  validatePostal(code: any) {
    if (code === null || code === undefined) return false;
    const s = String(code).trim();
    return /^[0-9]{5}$/.test(s);
  }

  saveDirectAddress() {
    if (!this.selectedAddress) return;
    const payload: any = {
      fullName: this.selectedAddress.fullName,
      address: this.selectedAddress.address,
      city: this.selectedAddress.city,
      postalCode: this.selectedAddress.postalCode,
      phone: this.selectedAddress.phone
    };

    this.userService.saveAddressDirect(payload).pipe(
      catchError(err => { this.error = err?.error?.message || err?.message || 'Errore durante il salvataggio diretto'; return of(null); })
    ).subscribe(res => {
      if (res) {
        this.loadAddresses();
        this.selectedAddress = null;
      }
    });
  }
}
