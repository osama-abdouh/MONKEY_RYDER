import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-data.html',
  styleUrl:'./personal-data.css'
})
export class PersonalDataComponent implements OnInit {
  personalForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.personalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    // Qui potresti caricare i dati personali dal backend e patchare il form
  }

  onSubmit() {
    if (this.personalForm.valid) {
      console.log('Dati personali aggiornati', this.personalForm.value);
      // Invia i dati al backend per aggiornare
    }
  }
}
