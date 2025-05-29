import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserContextService } from '../../services/user-context.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipAvatar, MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { TranslocoPipe } from '@ngneat/transloco';
import { availableUsers } from '../../models/constants/available-users.constant';
import { NgOptimizedImage } from '@angular/common';
import { AvailableUserInterface } from '../../models/interfaces/available-user.interface';

@Component({
  selector: 'app-select-user',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    TranslocoPipe,
    MatChipListbox,
    MatChipOption,
    NgOptimizedImage,
    MatChipAvatar
  ],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss'
})
export class SelectUserComponent {
  private readonly router: Router = inject(Router);
  readonly userContext: UserContextService = inject(UserContextService);
  readonly users: AvailableUserInterface[] = availableUsers;

  selectUser(user: string) {
    this.userContext.setUser(user);
    void this.router.navigateByUrl('/');
  }
}
