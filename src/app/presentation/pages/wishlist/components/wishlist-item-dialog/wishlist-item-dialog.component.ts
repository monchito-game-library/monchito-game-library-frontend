import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { LibButtonComponent } from '@/lib/lib-button/lib-button.component';
import { LibIconButtonComponent } from '@/lib/lib-icon-button/lib-icon-button.component';
import { LibFormFieldComponent } from '@/lib/lib-form-field/lib-form-field.component';
import { LibInputDirective } from '@/lib/lib-form-field/lib-input.directive';
import { LibLabelComponent } from '@/lib/lib-form-field/lib-label.component';
import { LibErrorComponent } from '@/lib/lib-form-field/lib-error.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgOptimizedImage, SlicePipe } from '@angular/common';

import { CatalogSearchPanelComponent } from '@/components/catalog-search-panel/catalog-search-panel.component';
import { WishlistItemForm } from '@/interfaces/forms/wishlist-item-form.interface';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { WISHLIST_PRIORITY_OPTIONS } from '@/constants/wishlist-priority.constant';
import { WishlistItemDialogData, WishlistItemDialogResult } from '@/interfaces/wishlist-item-dialog.interface';
import {
  LIB_DIALOG_DATA,
  LibDialogActionsDirective,
  LibDialogContentDirective,
  LibDialogRef,
  LibDialogTitleDirective
} from '@/services/lib-dialog/lib-dialog.service';

@Component({
  selector: 'app-wishlist-item-dialog',
  templateUrl: './wishlist-item-dialog.component.html',
  styleUrl: './wishlist-item-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LibDialogTitleDirective,
    LibDialogContentDirective,
    LibDialogActionsDirective,
    LibIconButtonComponent,
    MatFormField,
    MatLabel,
    MatError,
    MatSelect,
    MatOption,
    NgOptimizedImage,
    TranslocoPipe,
    CatalogSearchPanelComponent,
    SlicePipe,
    LibButtonComponent,
    LibFormFieldComponent,
    LibInputDirective,
    LibLabelComponent,
    LibErrorComponent
  ]
})
export class WishlistItemDialogComponent {
  private readonly _dialogRef: LibDialogRef<WishlistItemDialogComponent, WishlistItemDialogResult | null> = inject(
    LibDialogRef<WishlistItemDialogComponent, WishlistItemDialogResult | null>
  );
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** Dialog configuration: mode and optional existing item. */
  readonly config: WishlistItemDialogData = inject<WishlistItemDialogData>(LIB_DIALOG_DATA);

  /** Available priority levels (1–5). */
  readonly priorityOptions: number[] = WISHLIST_PRIORITY_OPTIONS;

  /** In add mode: tracks whether the user has selected a game from search. */
  readonly selectedCatalogEntry: WritableSignal<GameCatalogDto | null> = signal<GameCatalogDto | null>(null);

  /** Whether the search panel is visible (add mode only, before a game is selected). */
  readonly showSearch: WritableSignal<boolean> = signal(this.config.mode === 'add');

  /** Reactive form. */
  readonly form: FormGroup<WishlistItemForm> = this._fb.group<WishlistItemForm>({
    priority: this._fb.control<number>(this.config.item?.priority ?? 3, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(5)]
    }),
    platform: this._fb.control<string | null>(
      this.config.item?.platform || null,
      this.config.mode === 'add' ? [Validators.required] : []
    ),
    desiredPrice: this._fb.control<number | null>(this.config.item?.desiredPrice ?? null, [
      Validators.required,
      Validators.min(0)
    ]),
    notes: this._fb.control<string | null>(this.config.item?.notes ?? null)
  });

  /**
   * Called when the user selects a game from the search panel.
   * Transitions from search view to form view and resets the platform selection.
   *
   * @param {GameCatalogDto} game - Game selected from the catalogue
   */
  onGameSelected(game: GameCatalogDto): void {
    this.selectedCatalogEntry.set(game);
    this.form.controls.platform.setValue(null);
    this.showSearch.set(false);
  }

  /**
   * Returns to the search panel so the user can pick a different game.
   */
  onChangGame(): void {
    this.selectedCatalogEntry.set(null);
    this.showSearch.set(true);
  }

  /**
   * Returns true if the confirm button should be enabled.
   * In add mode the user must have selected a game first.
   */
  canConfirm(): boolean {
    return this.form.valid && (this.config.mode !== 'add' || !!this.selectedCatalogEntry());
  }

  /**
   * Closes the dialog and returns the selected game and form values.
   */
  onConfirm(): void {
    if (!this.canConfirm()) return;
    const result: WishlistItemDialogResult = {
      formValue: this.form.getRawValue()
    };
    if (this.config.mode === 'add') {
      result.catalogEntry = this.selectedCatalogEntry()!;
    }
    this._dialogRef.close(result);
  }

  /**
   * Closes the dialog without saving.
   */
  onCancel(): void {
    this._dialogRef.close(null);
  }
}
