import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ReadyDialogComponent, ReadyDialogData, ReadyLineData } from './ready-dialog.component';
import { OrderLineModel } from '@/models/order/order-line.model';
import { PackSuggestion } from '@/shared/pack-optimizer.util';

const mockDialogRef = { close: vi.fn() };

const makeOrderLine = (overrides: Partial<OrderLineModel> = {}): OrderLineModel => ({
  id: 'line-1',
  orderId: 'order-1',
  productId: 'product-1',
  requestedBy: 'user-1',
  quantityNeeded: 10,
  productName: 'Producto A',
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

const makeSuggestion = (overrides: Partial<PackSuggestion> = {}): PackSuggestion => ({
  totalUnits: 25,
  totalCost: 25,
  unitPrice: 1,
  breakdown: [{ pack: { url: '', price: 5, quantity: 25 }, count: 1 }],
  ...overrides
});

const makeLine = (overrides: Partial<ReadyLineData> = {}): ReadyLineData => ({
  line: makeOrderLine(),
  totalNeeded: 10,
  suggestions: [makeSuggestion()],
  ...overrides
});

const setupTestBed = (data: ReadyDialogData): ComponentFixture<ReadyDialogComponent> => {
  TestBed.configureTestingModule({
    imports: [
      ReadyDialogComponent,
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
  const fixture = TestBed.createComponent(ReadyDialogComponent);
  fixture.detectChanges();
  return fixture;
};

// ─── canConfirm ───────────────────────────────────────────────────────────────

describe('ReadyDialogComponent — canConfirm()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve true cuando todas las líneas tienen al menos una sugerencia', () => {
    const fixture = setupTestBed({
      lines: [
        makeLine({ line: makeOrderLine({ id: 'line-1' }), suggestions: [makeSuggestion()] }),
        makeLine({ line: makeOrderLine({ id: 'line-2' }), suggestions: [makeSuggestion()] })
      ]
    });
    expect(fixture.componentInstance.canConfirm()).toBe(true);
  });

  it('devuelve false cuando alguna línea tiene sugerencias vacías', () => {
    const fixture = setupTestBed({
      lines: [
        makeLine({ line: makeOrderLine({ id: 'line-1' }), suggestions: [makeSuggestion()] }),
        makeLine({ line: makeOrderLine({ id: 'line-2' }), suggestions: [] })
      ]
    });
    expect(fixture.componentInstance.canConfirm()).toBe(false);
  });
});

// ─── getSelectedIndex ─────────────────────────────────────────────────────────

describe('ReadyDialogComponent — getSelectedIndex()', () => {
  let component: ReadyDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const fixture = setupTestBed({
      lines: [
        makeLine({
          line: makeOrderLine({ id: 'line-1' }),
          suggestions: [makeSuggestion(), makeSuggestion({ totalUnits: 50, totalCost: 45, unitPrice: 0.9 })]
        })
      ]
    });
    component = fixture.componentInstance;
  });

  it('devuelve 0 por defecto para una línea', () => {
    expect(component.getSelectedIndex('line-1')).toBe(0);
  });

  it('devuelve el índice actualizado tras onSelectSuggestion', () => {
    component.onSelectSuggestion('line-1', 1);
    expect(component.getSelectedIndex('line-1')).toBe(1);
  });

  it('devuelve 0 para un lineId desconocido (rama ?? 0)', () => {
    expect(component.getSelectedIndex('line-inexistente')).toBe(0);
  });
});

// ─── onSelectSuggestion ───────────────────────────────────────────────────────

describe('ReadyDialogComponent — onSelectSuggestion()', () => {
  let component: ReadyDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const fixture = setupTestBed({
      lines: [
        makeLine({ line: makeOrderLine({ id: 'line-1' }), suggestions: [makeSuggestion(), makeSuggestion()] }),
        makeLine({ line: makeOrderLine({ id: 'line-2' }), suggestions: [makeSuggestion()] })
      ]
    });
    component = fixture.componentInstance;
  });

  it('actualiza el índice seleccionado para la línea indicada', () => {
    component.onSelectSuggestion('line-1', 1);
    expect(component.getSelectedIndex('line-1')).toBe(1);
  });

  it('no modifica los índices de otras líneas al actualizar una', () => {
    component.onSelectSuggestion('line-1', 1);
    expect(component.getSelectedIndex('line-2')).toBe(0);
  });
});

// ─── formatBreakdown ──────────────────────────────────────────────────────────

describe('ReadyDialogComponent — formatBreakdown()', () => {
  let component: ReadyDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const fixture = setupTestBed({ lines: [makeLine()] });
    component = fixture.componentInstance;
  });

  it('formatea "1× Pack 25" para un único pack', () => {
    const suggestion = makeSuggestion({
      breakdown: [{ pack: { url: '', price: 5, quantity: 25 }, count: 1 }]
    });
    expect(component.formatBreakdown(suggestion)).toBe('1× Pack 25');
  });

  it('formatea "2× Pack 50 + 1× Pack 10" para múltiples packs', () => {
    const suggestion = makeSuggestion({
      breakdown: [
        { pack: { url: '', price: 10, quantity: 50 }, count: 2 },
        { pack: { url: '', price: 2, quantity: 10 }, count: 1 }
      ]
    });
    expect(component.formatBreakdown(suggestion)).toBe('2× Pack 50 + 1× Pack 10');
  });
});

// ─── onConfirm ────────────────────────────────────────────────────────────────

describe('ReadyDialogComponent — onConfirm()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a dialogRef.close con el resultado correcto para cada línea', () => {
    const suggestion = makeSuggestion({ totalUnits: 25, unitPrice: 1.5 });
    const fixture = setupTestBed({
      lines: [makeLine({ line: makeOrderLine({ id: 'line-1' }), suggestions: [suggestion] })]
    });

    fixture.componentInstance.onConfirm();

    expect(mockDialogRef.close).toHaveBeenCalledOnce();
    expect(mockDialogRef.close).toHaveBeenCalledWith([{ lineId: 'line-1', unitPrice: 1.5, quantityOrdered: 25 }]);
  });

  it('usa la sugerencia seleccionada (no siempre la 0) para construir el resultado', () => {
    const suggestion0 = makeSuggestion({ totalUnits: 25, unitPrice: 1.5 });
    const suggestion1 = makeSuggestion({ totalUnits: 50, unitPrice: 1.2 });
    const fixture = setupTestBed({
      lines: [makeLine({ line: makeOrderLine({ id: 'line-1' }), suggestions: [suggestion0, suggestion1] })]
    });

    fixture.componentInstance.onSelectSuggestion('line-1', 1);
    fixture.componentInstance.onConfirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith([{ lineId: 'line-1', unitPrice: 1.2, quantityOrdered: 50 }]);
  });
});

// ─── onCancel ─────────────────────────────────────────────────────────────────

describe('ReadyDialogComponent — onCancel()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a dialogRef.close con undefined', () => {
    const fixture = setupTestBed({ lines: [makeLine()] });

    fixture.componentInstance.onCancel();

    expect(mockDialogRef.close).toHaveBeenCalledOnce();
    expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
