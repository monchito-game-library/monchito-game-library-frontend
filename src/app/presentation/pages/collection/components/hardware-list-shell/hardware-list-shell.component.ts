import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  TemplateRef
} from '@angular/core';
import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { ListPageHeaderComponent } from '@/pages/collection/components/list-page-header/list-page-header.component';
import { HardwareListItem } from '@/interfaces/hardware-list-item.interface';

/**
 * Presentational shell component that renders the shared list layout for hardware
 * pages (consoles and controllers). All display data is received as signal inputs
 * and user actions are emitted as outputs.
 *
 * Entity-specific content is provided via TemplateRef inputs:
 * - cardHeaderTpl — left side of the card header (icon or color circle)
 * - cardChipsTpl  — chips row below the header
 */
@Component({
  selector: 'app-hardware-list-shell',
  templateUrl: './hardware-list-shell.component.html',
  styleUrl: './hardware-list-shell.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgTemplateOutlet,
    MatButton,
    MatFabButton,
    MatIcon,
    MatProgressSpinner,
    TranslocoPipe,
    SkeletonComponent,
    ListPageHeaderComponent
  ]
})
export class HardwareListShellComponent {
  /** Whether the data is still loading. */
  readonly loading: InputSignal<boolean> = input.required<boolean>();

  /** Full list of hardware items (used for count and empty-state checks). */
  readonly items: InputSignal<HardwareListItem[]> = input.required<HardwareListItem[]>();

  /** Filtered list of hardware items (used for iteration and count display). */
  readonly filteredItems: InputSignal<HardwareListItem[]> = input.required<HardwareListItem[]>();

  /** Sum of prices for all filtered items, displayed in the stats bar. */
  readonly totalSpent: InputSignal<number> = input.required<number>();

  /** Current value of the search input. */
  readonly searchQuery: InputSignal<string> = input.required<string>();

  /** Material icon name for the item-count stat (e.g. 'tv' or 'gamepad'). */
  readonly statIcon: InputSignal<string> = input.required<string>();

  /** Material icon name for the empty-state illustration (e.g. 'tv_off' or 'gamepad'). */
  readonly emptyIcon: InputSignal<string> = input.required<string>();

  /**
   * Transloco key prefix used to resolve all i18n strings for this page.
   * e.g. 'consolesPage' or 'controllersPage'.
   */
  readonly i18nPrefix: InputSignal<string> = input.required<string>();

  /** Function that resolves a hardware model UUID to its display name. */
  readonly resolveModelName: InputSignal<(id: string | null) => string> =
    input.required<(id: string | null) => string>();

  /** Function that resolves a hardware brand UUID to its display name. */
  readonly resolveBrandName: InputSignal<(id: string | null) => string> =
    input.required<(id: string | null) => string>();

  /** Function that resolves a store UUID to its display label. */
  readonly resolveStoreName: InputSignal<(id: string | null) => string> =
    input.required<(id: string | null) => string>();

  /** Template for the left part of the card header (icon or color circle). */
  readonly cardHeaderTpl: InputSignal<TemplateRef<unknown>> = input.required<TemplateRef<unknown>>();

  /** Template for the chips row below the card header. */
  readonly cardChipsTpl: InputSignal<TemplateRef<unknown>> = input.required<TemplateRef<unknown>>();

  /** Emits the new search string when the search field changes. */
  readonly searchChange: OutputEmitterRef<string> = output<string>();

  /** Emits when the user clicks any "add" action (header button, empty-state button, or FAB). */
  readonly addClick: OutputEmitterRef<void> = output<void>();

  /** Emits the tapped item when the user clicks a card. */
  readonly detailClick: OutputEmitterRef<HardwareListItem> = output<HardwareListItem>();
}
