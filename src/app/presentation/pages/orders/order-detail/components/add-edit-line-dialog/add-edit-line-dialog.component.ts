import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderLineModel } from '@/models/order/order-line.model';
import { OrderLineForm, OrderLineFormValue } from '@/interfaces/forms/order-line-form.interface';

/** Data injected into the AddEditLineDialog. */
export interface AddEditLineDialogData {
  /** List of available products to select from. */
  products: OrderProductModel[];
  /** Existing line data for edit mode; undefined for create mode. */
  line?: OrderLineModel;
  /** Product IDs already added by the current user (create mode only). */
  takenProductIds?: string[];
}

@Component({
  selector: 'app-add-edit-line-dialog',
  templateUrl: './add-edit-line-dialog.component.html',
  styleUrl: './add-edit-line-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatButton,
    TranslocoPipe
  ]
})
export class AddEditLineDialogComponent implements OnInit {
  private readonly _dialogRef: MatDialogRef<AddEditLineDialogComponent, OrderLineFormValue | undefined> = inject(
    MatDialogRef<AddEditLineDialogComponent, OrderLineFormValue | undefined>
  );
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** Data injected by the parent: list of products and optional existing line. */
  readonly data: AddEditLineDialogData = inject<AddEditLineDialogData>(MAT_DIALOG_DATA);

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

  ngOnInit(): void {}

  /**
   * Sets the productId form control when the user selects a product from the autocomplete.
   *
   * @param {MatAutocompleteSelectedEvent} event - The selection event containing the product id
   */
  onProductSelected(event: MatAutocompleteSelectedEvent): void {
    const product = this.data.products.find((p) => p.id === event.option.value);
    this.form.controls.productId.setValue(event.option.value);
    this.productSearchControl.setValue(product?.name ?? null, { emitEvent: false });
    if (this.data.takenProductIds?.includes(event.option.value)) {
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
