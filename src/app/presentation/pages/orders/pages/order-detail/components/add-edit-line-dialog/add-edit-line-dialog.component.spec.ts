import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
      { provide: MatDialogRef, useValue: mockDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: data }
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

  it('productSearchControl comienza con valor null', () => {
    expect(component.productSearchControl.value).toBeNull();
  });

  it('productSearchControl está habilitado', () => {
    expect(component.productSearchControl.enabled).toBe(true);
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

  it('productSearchControl muestra el nombre del producto', () => {
    expect(component.productSearchControl.value).toBe('Producto Alpha');
  });

  it('productSearchControl está deshabilitado', () => {
    expect(component.productSearchControl.disabled).toBe(true);
  });

  it('form.controls.productId está deshabilitado', () => {
    expect(component.form.controls.productId.disabled).toBe(true);
  });
});

describe('AddEditLineDialogComponent — modo editar con producto no encontrado', () => {
  it('productSearchControl es null cuando el productId del pedido no existe en la lista de productos', () => {
    vi.clearAllMocks();
    const existingLine = makeOrderLine({ productId: 'unknown-product-id' });
    const fixture = setupTestBed({ products, line: existingLine });
    const component = fixture.componentInstance;

    expect(component.productSearchControl.value).toBeNull();
  });
});

// ─── onProductSelected ────────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — onProductSelected()', () => {
  let component: AddEditLineDialogComponent;
  let fixture: ComponentFixture<AddEditLineDialogComponent>;

  beforeEach(() => {
    vi.clearAllMocks();
    fixture = setupTestBed({ products, takenProductIds: ['product-2'] });
    component = fixture.componentInstance;
  });

  it('establece el productId en el formulario', () => {
    const event = { option: { value: 'product-1' } } as MatAutocompleteSelectedEvent;

    component.onProductSelected(event);

    expect(component.form.controls.productId.value).toBe('product-1');
  });

  it('establece el nombre del producto en productSearchControl', () => {
    const event = { option: { value: 'product-1' } } as MatAutocompleteSelectedEvent;

    component.onProductSelected(event);

    expect(component.productSearchControl.value).toBe('Producto Alpha');
  });

  it('establece el error alreadyExists cuando el producto está en takenProductIds', () => {
    const event = { option: { value: 'product-2' } } as MatAutocompleteSelectedEvent;

    component.onProductSelected(event);

    expect(component.form.controls.productId.errors).toEqual({ alreadyExists: true });
    expect(component.productSearchControl.errors).toEqual({ alreadyExists: true });
  });

  it('limpia los errores cuando el producto NO está en takenProductIds', () => {
    const invalidEvent = { option: { value: 'product-2' } } as MatAutocompleteSelectedEvent;
    component.onProductSelected(invalidEvent);

    const validEvent = { option: { value: 'product-1' } } as MatAutocompleteSelectedEvent;
    component.onProductSelected(validEvent);

    expect(component.form.controls.productId.errors).toBeNull();
    expect(component.productSearchControl.errors).toBeNull();
  });

  it('establece null en productSearchControl cuando el productId no existe en la lista', () => {
    const event = { option: { value: 'unknown-product-id' } } as MatAutocompleteSelectedEvent;

    component.onProductSelected(event);

    expect(component.productSearchControl.value).toBeNull();
  });
});

// ─── filteredProducts ─────────────────────────────────────────────────────────

describe('AddEditLineDialogComponent — filteredProducts signal', () => {
  let component: AddEditLineDialogComponent;
  let fixture: ComponentFixture<AddEditLineDialogComponent>;

  beforeEach(() => {
    vi.clearAllMocks();
    fixture = setupTestBed({ products });
    component = fixture.componentInstance;
  });

  it('devuelve [] cuando la búsqueda está vacía', () => {
    component.productSearchControl.setValue('');
    fixture.detectChanges();

    expect(component.filteredProducts()).toEqual([]);
  });

  it('filtra productos por nombre cuando hay texto de búsqueda', () => {
    component.productSearchControl.setValue('alpha');
    fixture.detectChanges();

    expect(component.filteredProducts()).toHaveLength(1);
    expect(component.filteredProducts()[0].id).toBe('product-1');
  });

  it('filtra productos por categoría cuando hay texto de búsqueda', () => {
    component.productSearchControl.setValue('categoría b');
    fixture.detectChanges();

    expect(component.filteredProducts()).toHaveLength(1);
    expect(component.filteredProducts()[0].id).toBe('product-2');
  });

  it('devuelve todos los coincidentes cuando el término es general', () => {
    component.productSearchControl.setValue('producto');
    fixture.detectChanges();

    expect(component.filteredProducts()).toHaveLength(2);
  });

  it('trata el valor null como cadena vacía y devuelve lista vacía', () => {
    component.productSearchControl.setValue(null);
    fixture.detectChanges();

    expect(component.filteredProducts()).toEqual([]);
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
