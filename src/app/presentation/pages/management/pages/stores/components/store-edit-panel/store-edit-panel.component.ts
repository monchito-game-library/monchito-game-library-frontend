import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';
import { StoreFormResult } from '@/interfaces/management/store-form-result.interface';

@Component({
  selector: 'app-store-edit-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    TranslocoPipe
  ],
  templateUrl: './store-edit-panel.component.html',
  styleUrl: './store-edit-panel.component.scss'
})
export class StoreEditPanelComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** The store to edit, or null when creating a new one. */
  readonly store = input<StoreModel | null>(null);

  /** Emitted when the user confirms the form. */
  readonly saved = output<StoreFormResult>();

  /** Emitted when the user cancels or closes the panel. */
  readonly cancelled = output<void>();

  /** Emitted when the user requests deletion of the current store. */
  readonly deleted = output<void>();

  readonly form = this._fb.group({
    name: ['' as string, Validators.required],
    formatHint: [null as GameFormatType | null]
  });

  constructor() {
    effect(() => {
      const s = this.store();
      this.form.patchValue({ name: s?.label ?? '', formatHint: s?.formatHint ?? null });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  /**
   * Validates the form and emits the result to the parent component.
   */
  onSave(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.saved.emit({
      label: raw.name as string,
      formatHint: raw.formatHint as GameFormatType | null
    });
  }
}
