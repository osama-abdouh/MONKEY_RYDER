import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from "../login/login";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, LoginComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  showDropdown = false;
  ToggleDropdown() {
    this.showDropdown = !this.showDropdown
  }
  closeDropdown = () => {
    this.showDropdown = false;
  }

}
