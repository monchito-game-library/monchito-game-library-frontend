import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';
import { HomeActionCardComponent } from '@/components/home-action-card/home-action-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, HomeActionCardComponent]
})
/** Landing page displaying the main navigation action cards. */
export class HomeComponent {}
