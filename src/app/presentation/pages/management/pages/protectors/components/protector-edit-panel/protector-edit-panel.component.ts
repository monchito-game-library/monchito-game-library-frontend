import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';

import { ProtectorModel } from '@/models/protector/protector.model';
import { ProtectorCategory } from '@/types/protector-category.type';
import { ProtectorFormResult } from '@/interfaces/management/protector-form-result.interface';

@Component({
  selector: 'app-protector-edit-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    TranslocoPipe
  ],
  templateUrl: './protector-edit-panel.component.html',
  styleUrl: './protector-edit-panel.component.scss'
})
export class ProtectorEditPanelComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** The protector to edit, or null when creating a new one. */
  readonly protector = input<ProtectorModel | null>(null);

  /** Emitted when the user confirms the form. */
  readonly saved = output<ProtectorFormResult>();

  /** Emitted when the user cancels or closes the panel. */
  readonly cancelled = output<void>();

  /** Emitted when the user toggles the active state of the protector. */
  readonly toggled = output<void>();

  /** Emitted when the user requests deletion of the protector. */
  readonly deleted = output<void>();

  readonly form = this._fb.group({
    name: ['' as string, Validators.required],
    category: ['box' as ProtectorCategory],
    notes: [null as string | null],
    packs: this._fb.array([])
  });

  constructor() {
    effect(() => {
      const p = this.protector();
      this.form.patchValue({ name: p?.name ?? '', category: p?.category ?? 'box', notes: p?.notes ?? null });
      while (this.packsArray.length) {
        this.packsArray.removeAt(0, { emitEvent: false });
      }
      (p?.packs ?? []).forEach((pack) => this.packsArray.push(this._buildPackGroup(pack), { emitEvent: false }));
      if (!p) {
        this.addPack();
      }
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  /** Typed accessor for the packs FormArray. */
  get packsArray(): FormArray {
    return this.form.get('packs') as FormArray;
  }

  /**
   * Casts an AbstractControl to FormGroup for use in the template.
   *
   * @param {import('@angular/forms').AbstractControl} control
   */
  asFormGroup(control: import('@angular/forms').AbstractControl): FormGroup {
    return control as FormGroup;
  }

  /**
   * Appends an empty pack row to the packs array.
   */
  addPack(): void {
    this.packsArray.push(
      this._buildPackGroup({ quantity: null as unknown as number, price: null as unknown as number, url: null })
    );
  }

  /**
   * Removes the pack at the given index.
   *
   * @param {number} index - Index of the pack row to remove
   */
  removePack(index: number): void {
    this.packsArray.removeAt(index);
  }

  /**
   * Validates the form and emits the result to the parent component.
   */
  onSave(): void {
    if (this.form.invalid || this.packsArray.length === 0) return;
    const raw = this.form.getRawValue();
    this.saved.emit({
      name: raw.name as string,
      category: raw.category as ProtectorCategory,
      notes: raw.notes?.trim() || null,
      packs: (raw.packs as { quantity: number; price: number; url: string | null }[]).map((p) => ({
        quantity: Number(p.quantity),
        price: Number(p.price),
        url: p.url?.trim() || null
      }))
    });
  }

  /**
   * Builds a FormGroup for a single pack row.
   *
   * @param {{ quantity: number; price: number; url: string | null }} pack
   */
  private _buildPackGroup(pack: { quantity: number; price: number; url: string | null }): FormGroup {
    return this._fb.group({
      quantity: [pack.quantity, [Validators.required, Validators.min(1)]],
      price: [pack.price, [Validators.required, Validators.min(0.01)]],
      url: [pack.url ?? '']
    });
  }
}
