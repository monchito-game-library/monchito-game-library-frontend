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
/** Presentational card component used on the home page to navigate to a feature. */
export class HomeActionCardComponent {
  /** Material icon name displayed on the card. */
  @Input({ required: true }) icon!: string;

  /** i18n key for the card title. */
  @Input({ required: true }) titleKey!: string;

  /** i18n key for the card description. */
  @Input({ required: true }) descriptionKey!: string;

  /** Router path the card links to. */
  @Input({ required: true }) routerLink!: string;
}
