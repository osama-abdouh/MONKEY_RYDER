import { Component, OnInit } from '@angular/core';
import { UserService, User} from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common'; 

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css'
})
export class UsersManagementComponent implements OnInit {
  loading: boolean = true;
  error: string | null = "";
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  showCreate: boolean = false;
  newUser: User = {
    user_id: 0,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    birth_date: '',
    phone_number: '',
    role: 'customer',
    account_status: 'active',
    created_at: '',
    last_login: ''
  };

  showDetails: boolean = false;
  selectedUser: User | null = null;
  isEditing: boolean = false;
  editedUser: User | null = null;

  showOrders: boolean = false;

  orderCount: any[] = [];

  //x impaginazione
  pageSize: number = 10;
  currentPage: number = 1;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  // funzioni che restituiscono gli utenti
  fetchUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data.filter(user => user.account_status !== 'deleted');
        this.filteredUsers = this.users;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento degli utenti.';
        this.loading = false;
      }
    });
  }
  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }
    //funzioni che gestiscono l'impaginazione
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  get displayedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  // funzioni x buttone crea utente
  resetForm(): void {
    this.newUser = {
      user_id: 0,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      birth_date: '',
      phone_number: '',
      role: 'customer',
      account_status: 'active',
      created_at: '',
      last_login: ''
    };
    this.error = null;
  }
  createUser(): void {
    this.userService.createUser(this.newUser).subscribe({
      next: (data: User) => {
        this.fetchUsers();
        this.resetForm();
        this.showCreate = false;
        alert('Utente creato con successo!');
      },
      error: (err) => {
        this.error = 'Errore nella creazione dell\'utente.';
      }
    });
  }
    toggleCreate(event: MouseEvent): void {
    this.showCreate = !this.showCreate
    if (this.showCreate) {
      this.resetForm();
    }
  }



  toggleDetails(event: MouseEvent, user: User): void {
    this.showDetails = !this.showDetails;
    this.isEditing = false;
    if (this.showDetails) {
      this.selectedUser = { ...user };
    }
  }
  toggleEdit(event: MouseEvent, user: User): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editedUser = { ...user };
    }
  }
  saveChanges(): void {
    if (!this.editedUser || !this.selectedUser) {
      this.error = 'Nessun utente selezionato per la modifica.';
      return;
    }
    console.log('Edited User:', this.editedUser);
    console.log('Selected User:', this.selectedUser);

    this.userService.updateUser(this.editedUser.user_id, this.editedUser).subscribe({
      next: (response: any) => {
        this.fetchUsers();
        this.selectedUser = response.user || response;
        this.isEditing = false;
        alert('Utente aggiornato con successo!');
      },
      error: (err) => {
        alert(`Errore nell\'aggiornamento dell\'utente: ${err.message}`);
      }
    });
  }

  deleteUser(user: User): void {
    const confirmation = confirm(`Sei sicuro di voler eliminare l'utente ${user.first_name} ${user.last_name}?`);
    if (!confirmation) {
      return;
    }
    const updatedUser = { ...user, account_status: 'deleted' };
    this.userService.updateUser(user.user_id, updatedUser).subscribe({
      next: () => {
        this.fetchUsers();
        alert('Utente eliminato con successo!');
      },
      error: (err) => {
        this.error = 'Errore nell\'eliminazione dell\'utente.';
      }
    });
  }
}
