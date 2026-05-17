import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RetroButtonComponent } from '@/retro/retro-button/retro-button.component';
import { RetroFormFieldComponent } from '@/retro/retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '@/retro/retro-form-field/retro-input.directive';
import { RetroLabelComponent } from '@/retro/retro-form-field/retro-label.component';
import { RetroErrorComponent } from '@/retro/retro-form-field/retro-error.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { HardwareEditionFormResult } from '@/interfaces/management/hardware-edition-form-result.interface';

@Component({
  selector: 'app-hardware-edition-edit-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    RetroButtonComponent,
    RetroFormFieldComponent,
    RetroInputDirective,
    RetroLabelComponent,
    RetroErrorComponent
  ],
  templateUrl: './hardware-edition-edit-panel.component.html',
  styleUrl: './hardware-edition-edit-panel.component.scss'
})
export class HardwareEditionEditPanelComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** The edition to edit, or null when creating a new one. */
  readonly edition = input<HardwareEditionModel | null>(null);

  /** Emitted when the user confirms the form. */
  readonly saved = output<HardwareEditionFormResult>();

  /** Emitted when the user cancels. */
  readonly cancelled = output<void>();

  /** Emitted when the user requests deletion. */
  readonly deleted = output<void>();

  readonly form = this._fb.group({
    name: ['' as string, Validators.required]
  });

  constructor() {
    effect(() => {
      const e = this.edition();
      this.form.patchValue({ name: e?.name ?? '' });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  /**
   * Validates the form and emits the result.
   */
  onSave(): void {
    if (this.form.invalid) return;
    this.saved.emit({ name: this.form.getRawValue().name as string });
  }
}
