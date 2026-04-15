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
  /** Nombre del icono de Material Icons que se muestra a la izquierda. */
  readonly icon = input<string>('');

  /** Texto principal de la card. */
  readonly name = input<string>('');

  /** Badges opcionales mostrados bajo el nombre. */
  readonly chips = input<string[]>([]);

  /** Si true, aplica el estilo de selección activa. */
  readonly selected = input<boolean>(false);

  /** Si true, muestra el icono de chevron a la derecha. */
  readonly showChevron = input<boolean>(false);

  /** Emitido al hacer clic en la card. */
  readonly cardClick = output<void>();
}
