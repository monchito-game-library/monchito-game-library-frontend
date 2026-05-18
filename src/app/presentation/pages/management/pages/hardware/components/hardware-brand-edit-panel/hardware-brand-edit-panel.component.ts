import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RetroButtonComponent } from '@/retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@/components/retro/retro-icon/retro-icon.component';
import { RetroFormFieldComponent } from '@/retro/retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '@/retro/retro-form-field/retro-input.directive';
import { RetroLabelComponent } from '@/retro/retro-form-field/retro-label.component';
import { RetroErrorComponent } from '@/retro/retro-form-field/retro-error.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareBrandFormResult } from '@/interfaces/management/hardware-brand-form-result.interface';

@Component({
  selector: 'app-hardware-brand-edit-panel',
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
    RetroErrorComponent
  ],
  templateUrl: './hardware-brand-edit-panel.component.html',
  styleUrl: './hardware-brand-edit-panel.component.scss'
})
export class HardwareBrandEditPanelComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** The brand to edit, or null when creating a new one. */
  readonly brand = input<HardwareBrandModel | null>(null);

  /** Emitted when the user confirms the form. */
  readonly saved = output<HardwareBrandFormResult>();

  /** Emitted when the user cancels. */
  readonly cancelled = output<void>();

  /** Emitted when the user requests deletion. */
  readonly deleted = output<void>();

  readonly form = this._fb.group({
    name: ['' as string, Validators.required]
  });

  constructor() {
    effect(() => {
      const b = this.brand();
      this.form.patchValue({ name: b?.name ?? '' });
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
