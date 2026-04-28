import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-catalog-item-card',
  templateUrl: './catalog-item-card.component.html',
  styleUrl: './catalog-item-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  host: {
    '(click)': 'cardClick.emit()',
    '[class.catalog-item-card--selected]': 'selected()'
  }
})
export class CatalogItemCardComponent {
  /** Material Icons name displayed on the left. Used when svgIcon is not provided. */
  readonly icon = input<string>('');

  /** Path to an SVG asset used instead of a mat-icon (e.g. 'assets/images/console-home.svg'). */
  readonly svgIcon = input<string | null>(null);

  /** Main text of the card. */
  readonly name = input<string>('');

  /** Optional badges shown below the name. */
  readonly chips = input<string[]>([]);

  /** When true, applies the active selection style. */
  readonly selected = input<boolean>(false);

  /** When true, shows the chevron icon on the right. */
  readonly showChevron = input<boolean>(false);

  /** Emitted when the card is clicked. */
  readonly cardClick = output<void>();
}
