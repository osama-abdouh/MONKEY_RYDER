import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule , Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserMenuComponent } from "../../features/user-menu/user-menu";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, UserMenuComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  showDropdown = false;
  isAdmin: boolean = false;
  loginForm! : FormGroup;
  errorMessage: string = '';
  searchQuery: string = '';

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Sottoscrivi lo stato admin in modo da aggiornare UI automaticamente dopo login/logout
    this.authService.isAdmin$.subscribe({ next: (v) => this.isAdmin = v, error: () => this.isAdmin = false });
  }

  onLoginSubmit() {
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.showDropdown = false;
  // lo stato admin verrà aggiornato automaticamente via isAdmin$ (fetchAndSetAdmin chiamato in login)
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = 'Email o password errati';
        console.error(err);
      }
    });
  }

  ToggleDropdown() {
    this.showDropdown = !this.showDropdown
  }
  closeDropdown = () => {
    this.showDropdown = false;
  }
    // Chiude il dropdown quando si clicca fuori
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const profileMenu = target.closest('.profile-menu');
    
    // Se il click non è dentro il profile-menu, chiudi il dropdown
    if (!profileMenu && this.showDropdown) {
      this.showDropdown = false;
    }
  }
  // Previene la chiusura quando si clicca dentro il dropdown
  onDropdownClick(event: Event) {
    event.stopPropagation();
  }

  onSearch(event: Event): void {
    event.preventDefault(); // Previene il comportamento di invio del modulo

    if (this.searchQuery.trim()) {
      this.router.navigate(['/product-list'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.searchQuery = '';
    }
  }

}
