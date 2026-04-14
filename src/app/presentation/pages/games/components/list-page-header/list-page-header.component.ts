import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-list-page-header',
  templateUrl: './list-page-header.component.html',
  styleUrl: './list-page-header.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIconButton, MatFormField, MatLabel, MatPrefix, MatIcon, MatInput, TranslocoPipe]
})
export class ListPageHeaderComponent {
  /** Clave de transloco para el label del campo de búsqueda. */
  readonly searchPlaceholder = input<string>('');

  /** Valor actual del campo de búsqueda. */
  readonly searchValue = input<string>('');

  /** Si es true, muestra el botón de filtros (abre un panel lateral). */
  readonly showFilterBtn = input<boolean>(false);

  /** Número de filtros activos, mostrado como badge en el botón de filtros. */
  readonly filterCount = input<number>(0);

  /** Emitido cuando cambia el valor del campo de búsqueda. */
  readonly searchChange = output<string>();

  /** Emitido cuando se pulsa el botón de filtros. */
  readonly filterClick = output<void>();

  /** Emitido cuando se pulsa el botón de añadir. */
  readonly addClick = output<void>();
}
