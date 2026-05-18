import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroFormFieldComponent } from '@retro/retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '@retro/retro-form-field/components/retro-input/retro-input.directive';
import { RetroLabelComponent } from '@retro/retro-form-field/components/retro-label/retro-label.component';
import { RetroErrorComponent } from '@retro/retro-form-field/components/retro-error/retro-error.component';
import { RetroAutocompleteComponent } from '@retro/retro-autocomplete/retro-autocomplete.component';
import { RetroAutocompleteTriggerDirective } from '@retro/retro-autocomplete/directive/retro-autocomplete-trigger.directive';
import { RetroOptionComponent } from '@retro/retro-select/components/retro-option/retro-option.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderLineForm, OrderLineFormValue } from '@/interfaces/forms/order-line-form.interface';
import { AddEditLineDialogData } from '@/interfaces/orders/add-edit-line-dialog.interface';
import {
  RETRO_DIALOG_DATA,
  RetroDialogActionsDirective,
  RetroDialogContentDirective,
  RetroDialogRef,
  RetroDialogTitleDirective
} from '@retro/retro-dialog/services/retro-dialog.service';

@Component({
  selector: 'app-add-edit-line-dialog',
  templateUrl: './add-edit-line-dialog.component.html',
  styleUrl: './add-edit-line-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RetroDialogTitleDirective,
    RetroDialogContentDirective,
    RetroDialogActionsDirective,
    TranslocoPipe,
    RetroButtonComponent,
    RetroIconComponent,
    RetroFormFieldComponent,
    RetroInputDirective,
    RetroLabelComponent,
    RetroErrorComponent,
    RetroAutocompleteComponent,
    RetroAutocompleteTriggerDirective,
    RetroOptionComponent
  ]
})
export class AddEditLineDialogComponent {
  private readonly _dialogRef: RetroDialogRef<AddEditLineDialogComponent, OrderLineFormValue | undefined> = inject(
    RetroDialogRef<AddEditLineDialogComponent, OrderLineFormValue | undefined>
  );
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** Data injected by the parent: list of products and optional existing line. */
  readonly data: AddEditLineDialogData = inject<AddEditLineDialogData>(RETRO_DIALOG_DATA);

  /** Whether the dialog is in edit mode (line already exists). */
  readonly isEditMode: boolean = !!this.data.line;

  /** Text input control used to search and display the selected product name. */
  readonly productSearchControl: FormControl<string | null> = this._fb.control<string | null>({
    value: this.data.line ? (this.data.products.find((p) => p.id === this.data.line!.productId)?.name ?? null) : null,
    disabled: this.isEditMode
  });

  /** Filtered list of products based on the current search term. */
  readonly filteredProducts: WritableSignal<OrderProductModel[]> = signal<OrderProductModel[]>(this.data.products);

  /** Reactive form for adding or editing an order line. */
  readonly form: FormGroup<OrderLineForm> = this._fb.group<OrderLineForm>({
    productId: this._fb.control<string | null>(
      { value: this.data.line?.productId ?? null, disabled: this.isEditMode },
      Validators.required
    ),
    quantityNeeded: this._fb.control<number | null>(this.data.line?.quantityNeeded ?? null, [
      Validators.required,
      Validators.min(1)
    ]),
    notes: this._fb.control<string | null>(this.data.line?.notes ?? null)
  });

  constructor() {
    this.productSearchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const q = (value ?? '').toLowerCase().trim();
      this.filteredProducts.set(
        q.length > 0
          ? this.data.products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
          : []
      );
    });
  }

  /**
   * Sets the productId form control when the user selects a product from the autocomplete.
   *
   * @param {unknown} productId - ID del producto seleccionado.
   */
  onProductSelected(productId: unknown): void {
    const id: string = productId as string;
    const product = this.data.products.find((p) => p.id === id);
    this.form.controls.productId.setValue(id);
    this.productSearchControl.setValue(product?.name ?? null, { emitEvent: false });
    if (this.data.takenProductIds?.includes(id)) {
      this.form.controls.productId.setErrors({ alreadyExists: true });
      this.productSearchControl.setErrors({ alreadyExists: true });
    } else {
      this.form.controls.productId.setErrors(null);
      this.productSearchControl.setErrors(null);
    }
  }

  /**
   * Closes the dialog with the form value if valid, otherwise marks all fields as touched.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this._dialogRef.close(this.form.getRawValue());
  }

  /**
   * Closes the dialog without returning a value.
   */
  onCancel(): void {
    this._dialogRef.close(undefined);
  }
}
