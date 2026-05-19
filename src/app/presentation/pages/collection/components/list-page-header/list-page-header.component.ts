import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RetroIconButtonComponent } from '@retro/retro-icon-button/retro-icon-button.component';
import { RetroInputComponent } from '@retro/retro-input/retro-input.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';

@Component({
  selector: 'app-list-page-header',
  templateUrl: './list-page-header.component.html',
  styleUrl: './list-page-header.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RetroButtonComponent,
    RetroIconComponent,
    RetroIconButtonComponent,
    RetroInputComponent,
    TranslocoPipe
  ]
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
