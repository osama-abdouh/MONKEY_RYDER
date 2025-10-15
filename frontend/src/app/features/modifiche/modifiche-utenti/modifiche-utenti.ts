import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modifiche-utenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifiche-utenti.html',
  styleUrl: './modifiche-utenti.css'
})
export class ModificheUtenti {
  @Input() incomingMaxOrder: any = null;
  @Input() users: any[] = [];
  loading = false;
  error: string | null = null;
  // track IDs currently being updated to disable buttons
  updatingIds: Set<number | string> = new Set();

  // search/filter state
  query: string = '';
  filteredUsers: any[] = [];

  // new user modal state
  showCreate = false;
  creating = false;
  newUser: any = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    birth_date: '',
    phone_number: '',
    role: 'customer',
    account_status: 'active'
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // If parent provided users, use them; otherwise fetch from backend
    if (this.users && this.users.length) {
      this.filteredUsers = [...this.users];
    } else {
      this.loadUsers();
    }
  }

  ngOnChanges(): void {
    // whenever parent updates users, re-run filter
    this.applyFilter();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.userService.getUsersAll().subscribe({
      next: (data) => {
        this.users = data || [];
        // fetch orders count and merge
        this.userService.getOrdersCount().subscribe({
          next: (counts) => {
            const map = new Map((counts || []).map((c: any) => [String(c.user_id), c.orders_count || 0]));
            this.users = (this.users || []).map((u: any) => ({ ...u, orders_count: map.get(String(u.user_id)) || 0 }));
            this.applyFilter();
            this.loading = false;
          },
          error: (ce) => {
            console.error('Failed to load orders count', ce);
            // still show users without counts
            this.users = (this.users || []).map((u: any) => ({ ...u, orders_count: 0 }));
            this.applyFilter();
            this.loading = false;
          }
        });
      },
      error: (e) => { console.error('Failed to load users', e); this.error = e?.message || 'Errore caricamento utenti'; this.loading = false; }
    });
  }

  applyFilter(): void {
    const q = (this.query || '').trim().toLowerCase();
    if (!q) {
      this.filteredUsers = this.users ? [...this.users] : [];
      return;
    }
    this.filteredUsers = (this.users || []).filter(u => {
      const name = ((u.first_name || '') + ' ' + (u.last_name || '')).toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }

  onNewUser(): void {
    this.error = null;
    this.showCreate = true;
  }

  onEditUser(user?: any): void {
    console.log('ModificheUtenti: onEditUser clicked', user);
    // TODO: open edit UI for the selected user (user may be undefined if top-level button clicked)
  }

  cancelCreate(): void {
    if (this.creating) return;
    this.showCreate = false;
    this.newUser = { first_name: '', last_name: '', email: '', password: '', birth_date: '', phone_number: '', role: 'customer', account_status: 'active' };
  }

  submitCreate(): void {
    if (this.creating) return;
    const u = this.newUser || {};
    const first = (u.first_name || '').trim();
    const last = (u.last_name || '').trim();
    const email = (u.email || '').trim();
    const password = (u.password || '').trim();
    if (!first || !last || !email || !password) {
      this.error = 'Compila tutti i campi obbligatori';
      return;
    }
    this.creating = true;
    this.userService.createUser({
      first_name: first,
      last_name: last,
      email,
      password,
      birth_date: u.birth_date ? String(u.birth_date) : null,
      phone_number: u.phone_number ? String(u.phone_number) : null,
      role: u.role || 'customer',
      account_status: u.account_status || 'active'
    }).subscribe({
      next: () => {
        this.creating = false;
        this.showCreate = false;
        this.cancelCreate();
        this.loadUsers();
      },
      error: (e) => {
        console.error('Create user failed', e);
        this.error = e?.error?.message || 'Creazione utente fallita';
        this.creating = false;
      }
    });
  }

  onToggleRole(user?: any): void {
    if (!user) return;
    const id = user.user_id || user.id;

  // Determine current role in client values: use 'admin' directly as client value
  const currentClientRole = user.role === 'admin' ? 'admin' : (user.role || 'customer');
  const newClientRole = currentClientRole === 'admin' ? 'customer' : 'admin';

    if (this.updatingIds.has(id)) return;
    this.updatingIds.add(id);

    const prevRole = user.role;
  // optimistic update: set to DB-facing value ('admin' or 'customer')
  user.role = newClientRole;

  this.userService.updateUserRole(id, newClientRole).subscribe({
      next: (updated) => {
        this.updatingIds.delete(id);
        this.loadUsers();
      },
      error: (e) => {
        console.error('Failed to update role', e);
        user.role = prevRole;
        this.updatingIds.delete(id);
        this.error = 'Impossibile aggiornare il ruolo';
      }
    });
  }

  onBlockUser(user?: any): void {
    console.log('ModificheUtenti: onBlockUser clicked', user);
    if (!user) return;
    const id = user.user_id || user.id;
  // send DB-allowed values: 'suspended' for suspended users, 'active' to reactivate
  const newStatus = (user.account_status === 'suspended') ? 'active' : 'suspended';

    // prevent duplicate requests for same user
    if (this.updatingIds.has(id)) return;
    this.updatingIds.add(id);

    // optimistic UI change
    const prev = user.account_status;
    user.account_status = newStatus;

    this.userService.updateAccountStatus(id, newStatus).subscribe({
      next: (updated) => {
        console.log('Account status updated', updated);
        // keep the optimistic change; reload users to ensure server state matches
        this.updatingIds.delete(id);
        this.loadUsers();
      },
      error: (e) => {
        console.error('Failed to update status', e);
        // rollback optimistic change
        user.account_status = prev;
        this.updatingIds.delete(id);
        this.error = 'Impossibile aggiornare lo stato dell\'account';
      }
    });
  }

  getUserStatus(user: any): string {
    // return the DB value directly; template reads u.account_status as source of truth
    return user && user.account_status ? user.account_status : 'active';
  }

  onBackdropClick(ev: MouseEvent): void {
    if (ev && ev.target === ev.currentTarget) {
      this.cancelCreate();
    }
  }

  onDeleteUser(user?: any): void {
    if (!user) return;
    const id = user.user_id || user.id;
    if (this.updatingIds.has(id)) return;

  const confirmDelete = window.confirm(`Eliminare definitivamente l'utente ${user.email}?\nATTENZIONE: verranno eliminati anche tutti gli ordini associati.`);
    if (!confirmDelete) return;

    this.updatingIds.add(id);
  this.userService.deleteUser(id, true).subscribe({
      next: () => {
        // reload from server to reflect DB state
        this.updatingIds.delete(id);
        this.loadUsers();
      },
      error: (e) => {
        console.error('Failed to delete user', e);
        this.error = e?.error?.message || 'Impossibile eliminare utente';
        this.updatingIds.delete(id);
      }
    });
  }

}
