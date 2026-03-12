import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { TranslocoPipe } from '@ngneat/transloco';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-home-action-card',
  templateUrl: './home-action-card.component.html',
  styleUrl: './home-action-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatCardTitle, MatIcon, TranslocoPipe, MatCardContent, RouterLink]
})
export class HomeActionCardComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) titleKey!: string;
  @Input({ required: true }) descriptionKey!: string;
  @Input({ required: true }) routerLink!: string;
}
