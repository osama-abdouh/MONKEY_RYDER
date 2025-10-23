import { Component , Input} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-menu.html',
  styleUrls: ['./user-menu.css']
})
export class UserMenuComponent {
  @Input() closeDropdown!: () => void;

  constructor(public authService: AuthService) {}

}

