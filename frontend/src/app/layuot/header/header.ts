import { Component, HostListener } from '@angular/core';
import { RouterModule , Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../../features/auth/login/login";
import { UserMenuComponent } from "../../features/user-menu/user-menu";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, LoginComponent, UserMenuComponent, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  showDropdown = false;
  searchQuery: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

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
