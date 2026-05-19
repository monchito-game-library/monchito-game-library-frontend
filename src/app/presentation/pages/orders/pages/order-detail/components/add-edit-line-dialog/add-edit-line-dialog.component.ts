import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroFormFieldComponent } from '@retro/retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '@retro/retro-form-field/components/retro-input/retro-input.directive';
import { RetroLabelComponent } from '@retro/retro-form-field/components/retro-label/retro-label.component';
import { RetroInputComponent } from '@retro/retro-input/retro-input.component';
import { RetroSearchComponent } from '@retro/retro-search/retro-search.component';
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
    RetroInputComponent,
    RetroSearchComponent,
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

  /** Filtered list of products based on the current search term. */
  readonly filteredProducts: WritableSignal<OrderProductModel[]> = signal<OrderProductModel[]>([]);

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
    this.form.controls.productId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((id: string | null) => this.onProductValueChange(id));
  }

  /**
   * Función displayWith para retro-search: mapea el ID del producto a su nombre legible.
   *
   * @param {string | null} id - ID del producto seleccionado
   */
  readonly displayProductName = (id: string | null): string => {
    if (!id) return '';
    return this.data.products.find((p) => p.id === id)?.name ?? '';
  };

  /**
   * Filtra los productos visibles cuando el usuario escribe en el campo de búsqueda.
   *
   * @param {string} query - Texto escrito por el usuario
   */
  onProductQuery(query: string): void {
    const q: string = query.toLowerCase().trim();
    this.filteredProducts.set(
      q.length > 0
        ? this.data.products.filter(
            (p: OrderProductModel) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
          )
        : []
    );
  }

  /**
   * Valida si el producto seleccionado ya está tomado (alreadyExists).
   * Se llama cuando el FormControl de productId cambia.
   *
   * @param {string | null} id - ID del producto seleccionado
   */
  onProductValueChange(id: string | null): void {
    if (!id) return;
    if (this.data.takenProductIds?.includes(id)) {
      this.form.controls.productId.setErrors({ alreadyExists: true });
    } else {
      this.form.controls.productId.setErrors(null);
    }
  }

  /**
   * Devuelve el mensaje de error del campo product, o null si no hay error visible.
   */
  _getProductError(): string | null {
    const ctrl = this.form.controls.productId;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'orders.lines.productRequired';
    if (ctrl.hasError('alreadyExists')) return 'orders.lines.productAlreadyExists';
    return null;
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
