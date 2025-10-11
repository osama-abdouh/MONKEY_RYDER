import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modifiche-utenti',
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
    // load via /api/user/all which uses userDAO.Users(conn)
    this.userService.getUsersAll().subscribe({
      next: (data) => { this.users = data || []; this.applyFilter(); this.loading = false; },
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
    console.log('ModificheUtenti: onNewUser clicked');
    // TODO: open a create user dialog or navigate to user creation form
  }

  onEditUser(user?: any): void {
    console.log('ModificheUtenti: onEditUser clicked', user);
    // TODO: open edit UI for the selected user (user may be undefined if top-level button clicked)
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

}
