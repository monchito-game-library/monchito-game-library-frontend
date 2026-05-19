import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RETRO_DIALOG_DATA, RetroDialogRef } from '@retro/retro-dialog/services/retro-dialog.service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AddEditLineDialogComponent } from './add-edit-line-dialog.component';
import { AddEditLineDialogData } from '@/interfaces/orders/add-edit-line-dialog.interface';
import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderLineModel } from '@/models/order/order-line.model';

const mockDialogRef = { close: vi.fn() };

const makeProduct = (overrides: Partial<OrderProductModel> = {}): OrderProductModel => ({
  id: 'product-1',
  name: 'Producto Alpha',
  category: 'Categoría A',
  notes: null,
  packs: [],
  ...overrides
});

const makeOrderLine = (overrides: Partial<OrderLineModel> = {}): OrderLineModel => ({
  id: 'line-1',
  orderId: 'order-1',
  productId: 'product-1',
  requestedBy: 'user-1',
  quantityNeeded: 5,
  productName: 'Producto Alpha',
  productCategory: 'Categoría A',
  productUrl: null,
  unitPrice: 0,
  packChosen: null,
  quantityOrdered: null,
  notes: null,
  createdAt: '2026-01-01T00:00:00Z',
  allocations: [],
  ...overrides
});

const setupTestBed = (data: AddEditLineDialogData): ComponentFixture<AddEditLineDialogComponent> => {
  TestBed.configureTestingModule({
    imports: [
      AddEditLineDialogComponent,
      TranslocoTestingModule.forRoot({
        langs: { en: {} },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
      })
    ],
    providers: [
      { provide: RetroDialogRef, useValue: mockDialogRef },
      { provide: RETRO_DIALOG_DATA, useValue: data }
    ],
    schemas: [NO_ERRORS_SCHEMA]
  });
  const fixture = TestBed.createComponent(AddEditLineDialogComponent);
  fixture.detectChanges();
  return fixture;
};

const products = [
  makeProduct({ id: 'product-1', name: 'Producto Alpha', category: 'Categoría A' }),
  makeProduct({ id: 'product-2', name: 'Producto Beta', category: 'Categoría B' })
];

// ─── Modo crear ───────────────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — modo crear (sin line)', () => {
  let component: AddEditLineDialogComponent;
  let fixture: ComponentFixture<AddEditLineDialogComponent>;

  beforeEach(() => {
    vi.clearAllMocks();
    fixture = setupTestBed({ products, takenProductIds: ['product-2'] });
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('isEditMode es false', () => {
    expect(component.isEditMode).toBe(false);
  });

  it('form.controls.productId comienza con valor null', () => {
    expect(component.form.controls.productId.value).toBeNull();
  });

  it('form.controls.productId está habilitado', () => {
    expect(component.form.controls.productId.enabled).toBe(true);
  });
});

// ─── Modo editar ──────────────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — modo editar (con line)', () => {
  let component: AddEditLineDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const existingLine = makeOrderLine({ productId: 'product-1', quantityNeeded: 7 });
    const fixture = setupTestBed({ products, line: existingLine });
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('isEditMode es true', () => {
    expect(component.isEditMode).toBe(true);
  });

  it('form.controls.productId tiene el ID del producto en edición', () => {
    expect(component.form.controls.productId.value).toBe('product-1');
  });

  it('form.controls.productId está deshabilitado', () => {
    expect(component.form.controls.productId.disabled).toBe(true);
  });
});

// ─── displayProductName ────────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — displayProductName()', () => {
  let component: AddEditLineDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const fixture = setupTestBed({ products, takenProductIds: ['product-2'] });
    component = fixture.componentInstance;
  });

  it('devuelve el nombre del producto dado su ID', () => {
    expect(component.displayProductName('product-1')).toBe('Producto Alpha');
  });

  it('devuelve cadena vacía para ID desconocido', () => {
    expect(component.displayProductName('unknown-id')).toBe('');
  });

  it('devuelve cadena vacía para null', () => {
    expect(component.displayProductName(null)).toBe('');
  });
});

// ─── onProductValueChange ─────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — onProductValueChange()', () => {
  let component: AddEditLineDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const fixture = setupTestBed({ products, takenProductIds: ['product-2'] });
    component = fixture.componentInstance;
  });

  it('establece el error alreadyExists cuando el producto está en takenProductIds', () => {
    component.onProductValueChange('product-2');

    expect(component.form.controls.productId.errors).toEqual({ alreadyExists: true });
  });

  it('limpia los errores cuando el producto NO está en takenProductIds', () => {
    component.onProductValueChange('product-2');
    component.onProductValueChange('product-1');

    expect(component.form.controls.productId.errors).toBeNull();
  });

  it('no añade el error alreadyExists cuando el ID es null', () => {
    component.onProductValueChange(null);

    expect(component.form.controls.productId.errors?.['alreadyExists']).toBeUndefined();
  });
});

// ─── onProductQuery ────────────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — onProductQuery()', () => {
  let component: AddEditLineDialogComponent;
  let fixture: ComponentFixture<AddEditLineDialogComponent>;

  beforeEach(() => {
    vi.clearAllMocks();
    fixture = setupTestBed({ products });
    component = fixture.componentInstance;
  });

  it('devuelve [] cuando la búsqueda está vacía', () => {
    component.onProductQuery('');
    fixture.detectChanges();

    expect(component.filteredProducts()).toEqual([]);
  });

  it('filtra productos por nombre cuando hay texto de búsqueda', () => {
    component.onProductQuery('alpha');
    fixture.detectChanges();

    expect(component.filteredProducts()).toHaveLength(1);
    expect(component.filteredProducts()[0].id).toBe('product-1');
  });

  it('filtra productos por categoría cuando hay texto de búsqueda', () => {
    component.onProductQuery('categoría b');
    fixture.detectChanges();

    expect(component.filteredProducts()).toHaveLength(1);
    expect(component.filteredProducts()[0].id).toBe('product-2');
  });

  it('devuelve todos los coincidentes cuando el término es general', () => {
    component.onProductQuery('producto');
    fixture.detectChanges();

    expect(component.filteredProducts()).toHaveLength(2);
  });
});

// ─── onSubmit ─────────────────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — onSubmit()', () => {
  let component: AddEditLineDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const fixture = setupTestBed({ products });
    component = fixture.componentInstance;
  });

  it('llama a dialogRef.close con el valor del formulario cuando es válido', () => {
    component.form.controls.productId.setValue('product-1');
    component.form.controls.quantityNeeded.setValue(3);

    component.onSubmit();

    expect(mockDialogRef.close).toHaveBeenCalledOnce();
    expect(mockDialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 'product-1', quantityNeeded: 3 })
    );
  });

  it('marca todos los campos como tocados cuando el formulario es inválido', () => {
    component.onSubmit();

    expect(component.form.touched).toBe(true);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});

// ─── onCancel ─────────────────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — onCancel()', () => {
  let component: AddEditLineDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const fixture = setupTestBed({ products });
    component = fixture.componentInstance;
  });

  it('llama a dialogRef.close con undefined', () => {
    component.onCancel();

    expect(mockDialogRef.close).toHaveBeenCalledOnce();
    expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
