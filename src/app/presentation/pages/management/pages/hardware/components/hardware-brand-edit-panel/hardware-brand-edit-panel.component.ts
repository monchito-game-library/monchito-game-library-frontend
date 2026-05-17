import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LibButtonComponent } from '@/lib/lib-button/lib-button.component';
import { LibFormFieldComponent } from '@/lib/lib-form-field/lib-form-field.component';
import { LibInputDirective } from '@/lib/lib-form-field/lib-input.directive';
import { LibLabelComponent } from '@/lib/lib-form-field/lib-label.component';
import { LibErrorComponent } from '@/lib/lib-form-field/lib-error.component';
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
    LibButtonComponent,
    LibFormFieldComponent,
    LibInputDirective,
    LibLabelComponent,
    LibErrorComponent
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
