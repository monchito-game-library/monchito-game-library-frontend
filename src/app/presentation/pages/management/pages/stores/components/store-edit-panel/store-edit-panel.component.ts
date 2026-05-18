import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroSelectComponent } from '@retro/retro-select/retro-select.component';
import { RetroOptionComponent } from '@retro/retro-select/components/retro-option/retro-option.component';
import { RetroFormFieldComponent } from '@retro/retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '@retro/retro-form-field/retro-input.directive';
import { RetroLabelComponent } from '@retro/retro-form-field/retro-label.component';
import { RetroErrorComponent } from '@retro/retro-form-field/retro-error.component';
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
    RetroButtonComponent,
    RetroIconComponent,
    RetroFormFieldComponent,
    RetroInputDirective,
    RetroLabelComponent,
    RetroErrorComponent,
    RetroSelectComponent,
    RetroOptionComponent
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
