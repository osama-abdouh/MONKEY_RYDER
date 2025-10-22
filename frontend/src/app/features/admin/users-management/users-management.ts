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


  orderCount: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {

    this.fetchUsers();
  }

  fetchUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.filteredUsers = data;
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
  }
  viewUserDetails(user: User): void {
    // Implement view user details functionality
  }

  editUser(user: User): void {
    // Implement edit user functionality
  }

  changeRole(user: User): void {

  }
  createUser(): void {
    // Implement create user functionality
  }

  deleteUser(user: User): void {
    // Implement delete user functionality
  }

  toggleCreate(event: MouseEvent): void {
    this.showCreate = !this.showCreate
    if (this.showCreate) {
      this.resetForm();
    }
  }

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
}
