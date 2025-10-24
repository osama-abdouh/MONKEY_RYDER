import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule , Router} from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserMenuComponent } from "../../features/user-menu/user-menu";
import { AuthService } from '../../services/auth.service';
// per la barra di ricerca
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NgIf, UserMenuComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  showDropdown = false;
  isAdmin: boolean = false;
  loginForm! : FormGroup;
  errorMessage: string = '';
  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

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

    // sottoscrizione allo stato admin
    this.authService.isAdmin$.subscribe({ next: (v) => this.isAdmin = v, error: () => this.isAdmin = false });

    // Live search: debounce user input and navigate to product-list with query
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        const trimmed = q ? q.trim() : '';
        if (trimmed) {
          this.router.navigate(['/product-list'], { queryParams: { search: trimmed } });
        } else {
          // If search is empty, still navigate to product list without search param
          this.router.navigate(['/product-list'], { queryParams: {} });
        }
      });
  }

  onLoginSubmit() {
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.showDropdown = false;
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
      // keep the query visible in the header after submit
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

}
