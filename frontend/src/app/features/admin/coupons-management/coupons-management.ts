
import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Coupon {
  coupon_id: number;
  code: string;
  discount_type?: string;
  discount_value?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  uses_count?: number;
  max_uses?: number;
  min_order_amount?: number;
  active?: boolean;
}

@Component({
  selector: 'app-coupons-management',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './coupons-management.html',
  styleUrls: ['./coupons-management.css']
})
export class CouponsManagementComponent {
  
  searchTerm: string = '';
  loading = true;
  error: string | null = null;
  coupons: Coupon[] = [];
  
  modalVisible = false;
  editModel: Partial<Coupon> | null = null;

  private apiBase = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
    this.fetchCoupons();
  }

  
  get visibleCoupons(): Coupon[] {
    const q = (this.searchTerm || '').trim().toLowerCase();
    if (!q) return this.coupons;
    return this.coupons.filter(c => {
      const code = (c.code || '').toString().toLowerCase();
      const type = (c.discount_type || '').toString().toLowerCase();
      return code.includes(q) || type.includes(q);
    });
  }

  
  filterCoupons(): void {
    
  }

  
  toggleCreate(event?: Event) {
    if (event) event.stopPropagation();
    this.editModel = {};
    this.modalVisible = true;
  }

  // create a new coupon via API
  createCoupon() {
    if (!this.editModel) return;
    const payload: any = Object.assign({}, this.editModel);
    delete payload.coupon_id;
    
    if (payload.hasOwnProperty('description')) delete payload.description;
    console.log('createCoupon called with payload:', payload);
    this.http.post<any>(`${this.apiBase}/coupons`, payload).subscribe({
      next: (res) => {
        const created = res && (res.coupon || res) ? (res.coupon || res) : null;
        if (created) this.coupons.unshift(created);
        else this.fetchCoupons();
        this.closeModal();
        alert('Coupon creato');
      },
      error: (err) => {
        console.error('Errore create coupon', err);
        alert('Errore nella creazione del coupon');
      }
    });
  }

  fetchCoupons(): void {
    this.loading = true;
    this.error = null;
    this.http.get<any>(`${this.apiBase}/coupons`).subscribe({
      next: (res) => {
        if (res && res.success) this.coupons = res.coupons || [];
        else if (Array.isArray(res)) this.coupons = res;
        else this.coupons = [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore fetch coupons', err);
        this.error = 'Errore nel caricamento dei coupon';
        this.loading = false;
      }
    });
  }

  deleteCoupon(c: Coupon) {
    if (!confirm(`Eliminare il coupon "${c.code}" (id ${c.coupon_id})?`)) return;
    this.http.delete<any>(`${this.apiBase}/coupons/${c.coupon_id}`).subscribe({
      next: (res) => {
        this.coupons = this.coupons.filter(x => x.coupon_id !== c.coupon_id);
        alert('Coupon eliminato');
      },
      error: (err) => {
        console.error('Errore delete coupon', err);
        alert('Errore nella cancellazione del coupon');
      }
    });
  }

  editCoupon(c: Coupon) {
    this.openEditModal(c);
  }

  openEditModal(c: Coupon) {
    this.editModel = JSON.parse(JSON.stringify(c));
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.editModel = null;
  }

  saveEdit() {
    if (!this.editModel) return;
    const id = (this.editModel as any).coupon_id;
    const payload: any = Object.assign({}, this.editModel);
    delete payload.coupon_id;
    if (payload.hasOwnProperty('description')) delete payload.description;

    this.http.put<any>(`${this.apiBase}/coupons/${id}`, payload).subscribe({
      next: (res) => {
        const updated = res && (res.coupon || res) ? (res.coupon || res) : null;
        if (updated) {
          const idx = this.coupons.findIndex(x => x.coupon_id === updated.coupon_id);
          if (idx !== -1) this.coupons[idx] = updated;
        }
        this.closeModal();
        alert('Coupon aggiornato');
      },
      error: (err) => {
        console.error('Errore update coupon', err);
        alert('Errore nell\'aggiornamento del coupon');
      }
    });
  }


  onInput(event: Event, field: keyof Coupon) {
    const tgt = event.target as HTMLInputElement;
    if (!this.editModel) return;
    (this.editModel as any)[field] = tgt.value;
  }

  onNumberInput(event: Event, field: keyof Coupon) {
    const tgt = event.target as HTMLInputElement;
    if (!this.editModel) return;
    const v = tgt.value;
    (this.editModel as any)[field] = v === '' ? null : Number(v);
  }

 
  onSelect(event: Event, field: keyof Coupon) {
    const tgt = event.target as HTMLSelectElement;
    if (!this.editModel) return;
    const val = tgt.value;
    if (val === 'true') (this.editModel as any)[field] = true;
    else if (val === 'false') (this.editModel as any)[field] = false;
    else (this.editModel as any)[field] = val;
  }

  couponTrack(index: number, item: Coupon) {
    return item.coupon_id;
  }
}
