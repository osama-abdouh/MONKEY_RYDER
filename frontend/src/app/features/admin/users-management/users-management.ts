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
    id: 0,
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
        this.users = data;
        this.filteredUsers = data;
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
      id: 0,
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
    if (this.showDetails) {
      this.selectedUser = { ...user };
    }
  }

  viewUserDetails(user: User): void {
    // Implement view user details functionality
  }

  deleteUser(user: User): void {
    // Implement delete user functionality
  }


  editUser(user: User): void {
    // Implement edit user functionality
  }

  changeRole(user: User): void {

  }





}
