import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import { HardwareModelFormResult } from '@/interfaces/management/hardware-model-form-result.interface';
import { HardwareModelType } from '@/types/hardware-model.type';
import { ConsoleSpecsCategoryType } from '@/types/console-specs-category.type';
import { ConsoleSpecsMediaType } from '@/types/console-specs-media.type';
import { HARDWARE_MODEL_TYPE } from '@/constants/hardware-model.constant';
import { CONSOLE_SPECS_CATEGORY } from '@/constants/console-specs-category.constant';
import { CONSOLE_SPECS_MEDIA } from '@/constants/console-specs-media.constant';

@Component({
  selector: 'app-hardware-model-edit-panel',
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
  templateUrl: './hardware-model-edit-panel.component.html',
  styleUrl: './hardware-model-edit-panel.component.scss'
})
export class HardwareModelEditPanelComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _typeValue: Signal<HardwareModelType | null>;

  /** The model to edit, or null when creating a new one. */
  readonly model = input<HardwareModelModel | null>(null);

  /** Existing console specs for the model (only when model.type === 'console'). */
  readonly specs = input<HardwareConsoleSpecsModel | null>(null);

  /** Emitted when the user confirms the form. */
  readonly saved = output<HardwareModelFormResult>();

  /** Emitted when the user cancels. */
  readonly cancelled = output<void>();

  /** Emitted when the user requests deletion. */
  readonly deleted = output<void>();

  /** HARDWARE_MODEL_TYPE exposed to the template. */
  readonly HARDWARE_MODEL_TYPE = HARDWARE_MODEL_TYPE;

  /** CONSOLE_SPECS_CATEGORY exposed to the template. */
  readonly CONSOLE_SPECS_CATEGORY = CONSOLE_SPECS_CATEGORY;

  /** CONSOLE_SPECS_MEDIA exposed to the template. */
  readonly CONSOLE_SPECS_MEDIA = CONSOLE_SPECS_MEDIA;

  /** True when the selected type is 'console', controlling specs fields visibility. */
  readonly isConsole: Signal<boolean> = computed((): boolean => this._typeValue() === HARDWARE_MODEL_TYPE['CONSOLE']);

  readonly form = this._fb.group({
    name: ['' as string, Validators.required],
    type: [HARDWARE_MODEL_TYPE['CONSOLE'] as HardwareModelType, Validators.required],
    generation: [null as number | null],
    launchYear: [null as number | null],
    discontinuedYear: [null as number | null],
    category: [CONSOLE_SPECS_CATEGORY['HOME'] as ConsoleSpecsCategoryType],
    media: [CONSOLE_SPECS_MEDIA['OPTICAL_DISC'] as ConsoleSpecsMediaType],
    videoResolution: [null as string | null],
    unitsSoldMillion: [null as number | null]
  });

  constructor() {
    this._typeValue = toSignal(this.form.controls.type.valueChanges, {
      initialValue: this.form.controls.type.value
    });
    effect(() => {
      const m = this.model();
      const s = this.specs();
      this.form.patchValue({
        name: m?.name ?? '',
        type: m?.type ?? HARDWARE_MODEL_TYPE['CONSOLE'],
        generation: m?.generation ?? null,
        launchYear: s?.launchYear ?? null,
        discontinuedYear: s?.discontinuedYear ?? null,
        category: s?.category ?? CONSOLE_SPECS_CATEGORY['HOME'],
        media: s?.media ?? CONSOLE_SPECS_MEDIA['OPTICAL_DISC'],
        videoResolution: s?.videoResolution ?? null,
        unitsSoldMillion: s?.unitsSoldMillion ?? null
      });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  /**
   * Validates the form, assembles the result and emits it.
   * For console type, specs fields are also collected.
   */
  onSave(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();

    const isConsole = raw.type === HARDWARE_MODEL_TYPE['CONSOLE'];
    if (isConsole && !raw.launchYear) return;

    this.saved.emit({
      name: raw.name as string,
      type: raw.type as HardwareModelType,
      generation: raw.generation,
      specs: isConsole
        ? {
            launchYear: raw.launchYear as number,
            discontinuedYear: raw.discontinuedYear,
            category: raw.category as ConsoleSpecsCategoryType,
            media: raw.media as ConsoleSpecsMediaType,
            videoResolution: raw.videoResolution,
            unitsSoldMillion: raw.unitsSoldMillion
          }
        : null
    });
  }
}
