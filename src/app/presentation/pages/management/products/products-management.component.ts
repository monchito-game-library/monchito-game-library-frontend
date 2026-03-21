import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import {
  ORDER_PRODUCT_USE_CASES,
  OrderProductUseCasesContract
} from '@/domain/use-cases/order-product/order-product.use-cases.contract';
import { OrderProductModel } from '@/models/order-product/order-product.model';
import { OrderProductCategory } from '@/types/order-product-category.type';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';

/** Shape returned by the product form dialog. */
interface ProductFormResult {
  name: string;
  unitPrice: number;
  availablePacks: number[];
  category: OrderProductCategory;
  notes: string | null;
}

/** Dialog component for adding or editing an order product. */
@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatDialogModule,
    TranslocoPipe
  ],
  template: `
    <h2 mat-dialog-title>
      {{ (data.product ? 'management.products.editTitle' : 'management.products.addTitle') | transloco }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="product-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'management.products.nameLabel' | transloco }}</mat-label>
          <input matInput formControlName="name" [placeholder]="'management.products.namePlaceholder' | transloco" />
          @if (form.controls.name.hasError('required')) {
            <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'management.products.categoryLabel' | transloco }}</mat-label>
          <mat-select formControlName="category">
            <mat-option value="box">{{ 'management.products.categoryBox' | transloco }}</mat-option>
            <mat-option value="console">{{ 'management.products.categoryConsole' | transloco }}</mat-option>
            <mat-option value="other">{{ 'management.products.categoryOther' | transloco }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'management.products.unitPriceLabel' | transloco }}</mat-label>
          <input matInput formControlName="unitPrice" type="number" min="0" step="0.01" placeholder="0.89" />
          <mat-icon matSuffix>euro</mat-icon>
          @if (form.controls.unitPrice.hasError('required')) {
            <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
          } @else if (form.controls.unitPrice.hasError('min')) {
            <mat-error>{{ 'management.products.unitPriceMin' | transloco }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'management.products.availablePacksLabel' | transloco }}</mat-label>
          <input
            matInput
            formControlName="availablePacks"
            [placeholder]="'management.products.availablePacksPlaceholder' | transloco" />
          <mat-hint>{{ 'management.products.availablePacksHint' | transloco }}</mat-hint>
          @if (form.controls.availablePacks.hasError('required')) {
            <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
          } @else if (form.controls.availablePacks.hasError('invalidPacks')) {
            <mat-error>{{ 'management.products.availablePacksError' | transloco }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'management.products.notesLabel' | transloco }}</mat-label>
          <textarea
            matInput
            formControlName="notes"
            rows="2"
            [placeholder]="'management.products.notesPlaceholder' | transloco"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | transloco }}</button>
      <button mat-flat-button color="primary" (click)="onConfirm()" [disabled]="form.invalid">
        {{ 'common.save' | transloco }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .product-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.5rem;
        min-width: 340px;
      }
    `
  ]
})
export class ProductFormDialogComponent {
  private readonly _dialogRef: MatDialogRef<ProductFormDialogComponent, ProductFormResult> = inject(MatDialogRef);
  private readonly _fb: FormBuilder = inject(FormBuilder);

  readonly data: { product: OrderProductModel | null } = inject(MAT_DIALOG_DATA);

  readonly form = this._fb.group({
    name: [this.data.product?.name ?? '', Validators.required],
    category: [this.data.product?.category ?? ('box' as OrderProductCategory)],
    unitPrice: [this.data.product?.unitPrice ?? (null as number | null), [Validators.required, Validators.min(0.01)]],
    availablePacks: [
      this.data.product ? this.data.product.availablePacks.join(', ') : '',
      [Validators.required, this._packsValidator]
    ],
    notes: [this.data.product?.notes ?? (null as string | null)]
  });

  /**
   * Closes the dialog returning the new or updated product data.
   */
  onConfirm(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const packs = (raw.availablePacks ?? '')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    this._dialogRef.close({
      name: raw.name as string,
      unitPrice: raw.unitPrice as number,
      availablePacks: packs,
      category: raw.category as OrderProductCategory,
      notes: raw.notes?.trim() || null
    });
  }

  /**
   * Validates that the packs field contains at least one positive integer.
   *
   * @param {import('@angular/forms').AbstractControl} control
   */
  private _packsValidator(control: import('@angular/forms').AbstractControl): { invalidPacks: true } | null {
    const value: string = control.value ?? '';
    const packs = value
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);
    return packs.length > 0 ? null : { invalidPacks: true };
  }
}

/** Page for managing the shared order-product catalogue. */
@Component({
  selector: 'app-products-management',
  templateUrl: './products-management.component.html',
  styleUrl: './products-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIconButton, MatIcon, MatProgressSpinner, MatTooltip, TranslocoPipe]
})
export class ProductsManagementComponent implements OnInit {
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _productUseCases: OrderProductUseCasesContract = inject(ORDER_PRODUCT_USE_CASES);

  /** Whether the product list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** All products loaded from Supabase. */
  readonly products: WritableSignal<OrderProductModel[]> = signal([]);

  async ngOnInit(): Promise<void> {
    await this._loadProducts();
  }

  /**
   * Opens the add-product dialog and persists the new entry to Supabase.
   */
  onAddProduct(): void {
    const ref = this._dialog.open(ProductFormDialogComponent, { data: { product: null } });
    ref.afterClosed().subscribe(async (result?: ProductFormResult) => {
      if (!result) return;
      await this._productUseCases.addProduct({ ...result, isActive: true });
      await this._loadProducts();
    });
  }

  /**
   * Opens the edit dialog for a product and updates the entry in Supabase.
   *
   * @param {OrderProductModel} product - The product to edit
   */
  onEditProduct(product: OrderProductModel): void {
    const ref = this._dialog.open(ProductFormDialogComponent, { data: { product } });
    ref.afterClosed().subscribe(async (result?: ProductFormResult) => {
      if (!result) return;
      await this._productUseCases.updateProduct(product.id, result);
      await this._loadProducts();
    });
  }

  /**
   * Shows a confirmation dialog and toggles the product's active state on confirm.
   *
   * @param {OrderProductModel} product - The product to enable or disable
   */
  onToggleActive(product: OrderProductModel): void {
    const nextActive: boolean = !product.isActive;
    const key: string = nextActive ? 'management.products.activateConfirm' : 'management.products.deactivateConfirm';
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate(key, { name: product.name }),
        message: ''
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      await this._productUseCases.toggleProductActive(product.id, nextActive);
      await this._loadProducts();
    });
  }

  /**
   * Returns the i18n key for a product category.
   *
   * @param {OrderProductCategory} category
   */
  getCategoryLabel(category: OrderProductCategory): string {
    return this._transloco.translate(
      `management.products.category${category.charAt(0).toUpperCase() + category.slice(1)}`
    );
  }

  /**
   * Loads all products from Supabase and updates the products signal.
   */
  private async _loadProducts(): Promise<void> {
    this.loading.set(true);
    try {
      const products: OrderProductModel[] = await this._productUseCases.getAllProducts();
      this.products.set(products);
    } finally {
      this.loading.set(false);
    }
  }
}
