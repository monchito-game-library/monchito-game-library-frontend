import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
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
    MatSelect,
    MatOption,
    MatButton,
    TranslocoPipe
  ]
})
export class AddEditLineDialogComponent {
  private readonly _dialogRef: MatDialogRef<AddEditLineDialogComponent, OrderLineFormValue | undefined> = inject(
    MatDialogRef<AddEditLineDialogComponent, OrderLineFormValue | undefined>
  );
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** Data injected by the parent: list of products and optional existing line. */
  readonly data: AddEditLineDialogData = inject<AddEditLineDialogData>(MAT_DIALOG_DATA);

  /** Whether the dialog is in edit mode (line already exists). */
  readonly isEditMode: boolean = !!this.data.line;

  /** Reactive form for adding or editing an order line. */
  readonly form: FormGroup<OrderLineForm> = this._fb.group<OrderLineForm>({
    productId: this._fb.control<string | null>(
      { value: this.data.line?.productId ?? null, disabled: this.isEditMode },
      Validators.required
    ),
    unitPrice: this._fb.control<number | null>(this.data.line?.unitPrice ?? null, Validators.required),
    packChosen: this._fb.control<number | null>(this.data.line?.packChosen ?? null),
    quantityOrdered: this._fb.control<number | null>(this.data.line?.quantityOrdered ?? null),
    notes: this._fb.control<string | null>(this.data.line?.notes ?? null)
  });

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
