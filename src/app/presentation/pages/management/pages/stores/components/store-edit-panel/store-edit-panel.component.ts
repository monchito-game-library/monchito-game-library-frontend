import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LibButtonComponent } from '@/lib/lib-button/lib-button.component';
import { LibSelectComponent } from '@/lib/lib-select/lib-select.component';
import { LibOptionComponent } from '@/lib/lib-select/lib-option.component';
import { LibFormFieldComponent } from '@/lib/lib-form-field/lib-form-field.component';
import { LibInputDirective } from '@/lib/lib-form-field/lib-input.directive';
import { LibLabelComponent } from '@/lib/lib-form-field/lib-label.component';
import { LibErrorComponent } from '@/lib/lib-form-field/lib-error.component';
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
    TranslocoPipe,
    LibButtonComponent,
    LibFormFieldComponent,
    LibInputDirective,
    LibLabelComponent,
    LibErrorComponent,
    LibSelectComponent,
    LibOptionComponent
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
