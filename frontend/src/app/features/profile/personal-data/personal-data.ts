import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../../services/user.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './personal-data.html',
  styleUrls: ['./personal-data.css']
})
export class PersonalDataComponent implements OnInit {
  personalForm!: FormGroup;
  loading = false;
  error: string | null = null;
  editing = false;
  showPassword = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  pwdLoading = false;
  pwdError: string | null = null;
  pwdSuccess: string | null = null;

  constructor(private fb: FormBuilder, private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.personalForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      birth_date: [''],
      role: [{value: '', disabled: true}],
      account_status: [{value: '', disabled: true}],
      created_at: [{value: '', disabled: true}]
    });

    this.loadCurrentUser();
  }

  onChangePassword() {
    this.pwdError = null;
    this.pwdSuccess = null;
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.pwdError = 'Compila tutti i campi';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.pwdError = 'Le password non coincidono';
      return;
    }
    if (this.newPassword.length < 8) {
      this.pwdError = 'La nuova password deve avere almeno 8 caratteri';
      return;
    }

    this.pwdLoading = true;
    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: (res: any) => {
        this.pwdLoading = false;
        this.pwdSuccess = res && res.message ? res.message : 'Password aggiornata';
        this.showPassword = false;
        this.oldPassword = this.newPassword = this.confirmPassword = '';
      },
      error: (err: any) => {
        this.pwdLoading = false;
        this.pwdError = err?.error?.message || err?.message || 'Errore durante il cambio password';
      }
    });
  }

  cancelChangePassword() {
    this.showPassword = false;
    this.oldPassword = this.newPassword = this.confirmPassword = '';
    this.pwdError = this.pwdSuccess = null;
  }

  private loadCurrentUser() {
    this.loading = true;
    this.error = null;
    this.userService.getCurrentUser()
      .pipe(catchError(err => { this.error = err?.message || 'Errore nel caricare utente'; return of(null); }))
      .subscribe((u: User | null) => {
        this.loading = false;
        if (u) {
          // Helper per convertire date in formato yyyy-MM-dd per input[type=date]
          const toDateInput = (v: any) => {
            if (!v) return '';
            const d = new Date(v);
            if (isNaN(d.getTime())) return '';
            return d.toISOString().slice(0,10);
          };

          // patcha il form con i dati dal backend (formatta le date per gli input)
          this.personalForm.patchValue({
            first_name: (u as any).first_name || '',
            last_name: (u as any).last_name || '',
            email: (u as any).email || '',
            phone: (u as any).phone || '',
            birth_date: toDateInput((u as any).birth_date),
            role: (u as any).role || '',
            account_status: (u as any).account_status || '',
            created_at: (u as any).created_at ? new Date((u as any).created_at).toLocaleString() : ''
          });
          // rendi il form di sola lettura (disabilitato) per evitare modifiche
          try {
            this.personalForm.disable();
            this.editing = false;
          } catch (e) {
            // ignore
          }
        }
      });
  }

  onSubmit() {
    if (this.personalForm.valid) {
      console.log('Dati personali aggiornati', this.personalForm.value);
      // TODO: inviare i dati al backend per aggiornare il profilo
    }
  }

  edit() {
    this.editing = true;
    this.personalForm.enable();
  }

  cancelEdit() {
    this.editing = false;
    this.loadCurrentUser();
  }

  save() {
    if (!this.personalForm.valid) return;
    const payload: any = {};
    // prendi solo campi editabili
    ['first_name','last_name','email','phone','birth_date'].forEach(k => {
      const val = this.personalForm.get(k)?.value;
      if (k === 'birth_date') {
        if (val) payload[k] = val;
      } else {
        payload[k] = val;
      }
    });
    this.loading = true;
    this.userService.patchCurrentUser(payload).subscribe({
      next: (u) => {
        this.loading = false;
        this.editing = false;
        this.personalForm.patchValue(u as any);
        this.personalForm.disable();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Errore nel salvare';
      }
    });
  }

  formatDate(input: string | null | undefined) {
    if (!input) return '-';
    // se è già nel formato yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const d = new Date(input + 'T00:00:00');
      return d.toLocaleDateString();
    }
    const parsed = new Date(input);
    if (isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString();
  }
}
