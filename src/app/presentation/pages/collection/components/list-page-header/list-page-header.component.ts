import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LibIconButtonComponent } from '@/lib/lib-icon-button/lib-icon-button.component';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslocoPipe } from '@jsverse/transloco';

import { LibButtonComponent } from '@/lib/lib-button/lib-button.component';

@Component({
  selector: 'app-list-page-header',
  templateUrl: './list-page-header.component.html',
  styleUrl: './list-page-header.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LibButtonComponent, LibIconButtonComponent, MatFormField, MatLabel, MatPrefix, MatInput, TranslocoPipe]
})
export class ListPageHeaderComponent {
  /** Transloco key for the search field label. */
  readonly searchPlaceholder = input<string>('');

  /** Current value of the search field. */
  readonly searchValue = input<string>('');

  /** When true, shows the add button in the header. */
  readonly showAddBtn = input<boolean>(true);

  /** When true, all controls (search, filter, view-mode, add) render as disabled. */
  readonly disabled = input<boolean>(false);

  /** When true, shows the filter button (opens a side panel). */
  readonly showFilterBtn = input<boolean>(false);

  /** Number of active filters, displayed as a badge on the filter button. */
  readonly filterCount = input<number>(0);

  /** When true, shows the view-mode toggle button (grid/list). */
  readonly showViewModeBtn = input<boolean>(false);

  /** Current view mode used to render the appropriate toggle icon. */
  readonly viewMode = input<'grid' | 'list'>('grid');

  /** Emitted when the search field value changes. */
  readonly searchChange = output<string>();

  /** Emitted when the filter button is clicked. */
  readonly filterClick = output<void>();

  /** Emitted when the add button is clicked. */
  readonly addClick = output<void>();

  /** Emitted when the view-mode toggle is clicked. */
  readonly viewModeToggle = output<void>();
}
