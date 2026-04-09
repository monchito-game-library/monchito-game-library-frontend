import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ORDERS_USE_CASES } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { OrderModel } from '@/models/order/order.model';
import { PackSuggestion } from '@/interfaces/pack-optimizer.interface';
import { OrderStepperComponent } from './order-stepper.component';
import { MemberQty, PackStepData } from '@/interfaces/orders/order-stepper.interface';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeOrder = (overrides: Partial<OrderModel> = {}): OrderModel => ({
  id: 'order-1',
  ownerId: 'user-owner',
  title: 'Test Order',
  status: 'selecting_packs',
  orderDate: null,
  receivedDate: null,
  shippingCost: 10,
  paypalFee: 2,
  discountAmount: 0,
  discountType: 'amount',
  notes: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  members: [],
  lines: [
    {
      id: 'l1',
      orderId: 'order-1',
      productId: 'p1',
      requestedBy: 'user-owner',
      quantityNeeded: 10,
      productName: 'BoxA',
      productCategory: 'box',
      productUrl: null,
      unitPrice: 5,
      packChosen: null,
      quantityOrdered: 10,
      notes: null,
      createdAt: '2024-01-01',
      allocations: []
    },
    {
      id: 'l2',
      orderId: 'order-1',
      productId: 'p1',
      requestedBy: 'user-2',
      quantityNeeded: 5,
      productName: 'BoxA',
      productCategory: 'box',
      productUrl: null,
      unitPrice: 5,
      packChosen: null,
      quantityOrdered: 5,
      notes: null,
      createdAt: '2024-01-01',
      allocations: []
    }
  ],
  ...overrides
});

const makeSuggestion = (totalUnits: number, packQty = 10): PackSuggestion => ({
  totalUnits,
  totalCost: totalUnits * 0.5,
  unitPrice: 0.5,
  breakdown: [
    {
      count: totalUnits / packQty,
      pack: { url: 'https://example.com/pack', quantity: packQty, price: 0.5 * packQty }
    }
  ]
});

const makeStep = (overrides: Partial<PackStepData> = {}): PackStepData => ({
  productId: 'p1',
  productName: 'BoxA',
  totalNeeded: 15,
  suggestions: [makeSuggestion(20), makeSuggestion(30)],
  lineIds: ['l1', 'l2'],
  memberBreakdown: [
    { userId: 'user-owner', displayName: 'Owner', email: 'o@t.com', avatarUrl: null, qty: 10 },
    { userId: 'user-2', displayName: 'Member', email: 'm@t.com', avatarUrl: null, qty: 5 }
  ],
  ...overrides
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OrderStepperComponent', () => {
  let component: OrderStepperComponent;
  let mockUseCases: { updateLine: ReturnType<typeof vi.fn> };

  function createComponent(order: OrderModel, packSteps: PackStepData[], editingHeader = false) {
    const fixture = TestBed.createComponent(OrderStepperComponent);
    fixture.componentRef.setInput('order', order);
    fixture.componentRef.setInput('packSteps', packSteps);
    fixture.componentRef.setInput('editingHeader', editingHeader);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCases = { updateLine: vi.fn().mockResolvedValue(undefined) };

    TestBed.configureTestingModule({
      imports: [
        OrderStepperComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        { provide: ORDERS_USE_CASES, useValue: mockUseCases },
        { provide: MatSnackBar, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    component = createComponent(makeOrder(), [makeStep()]);
  });

  // ── getStepSelection ───────────────────────────────────────────────────────

  describe('getStepSelection', () => {
    it('devuelve 0 por defecto para cualquier productId', () => {
      expect(component.getStepSelection('p1')).toBe(0);
    });

    it('devuelve el índice actualizado tras llamar a onSelectPackOption', () => {
      component.onSelectPackOption('p1', 1);
      expect(component.getStepSelection('p1')).toBe(1);
    });

    it('devuelve 0 para un productId desconocido', () => {
      expect(component.getStepSelection('producto-inexistente')).toBe(0);
    });
  });

  // ── formatBreakdown ────────────────────────────────────────────────────────

  describe('formatBreakdown', () => {
    it('formatea correctamente una sugerencia con múltiples packs', () => {
      const suggestion: PackSuggestion = {
        totalUnits: 110,
        totalCost: 55,
        unitPrice: 0.5,
        breakdown: [
          { count: 2, pack: { url: 'https://example.com/pk50', quantity: 50, price: 25 } },
          { count: 1, pack: { url: 'https://example.com/pk10', quantity: 10, price: 5 } }
        ]
      };
      expect(component.formatBreakdown(suggestion)).toBe('2× Pack 50 + 1× Pack 10');
    });

    it('formatea correctamente una sugerencia con un solo pack', () => {
      const suggestion: PackSuggestion = {
        totalUnits: 25,
        totalCost: 12.5,
        unitPrice: 0.5,
        breakdown: [{ count: 1, pack: { url: 'https://example.com/pk25', quantity: 25, price: 12.5 } }]
      };
      expect(component.formatBreakdown(suggestion)).toBe('1× Pack 25');
    });
  });

  // ── getMemberAllocations ───────────────────────────────────────────────────

  describe('getMemberAllocations', () => {
    it('devuelve el breakdown sin modificar cuando el step no está confirmado', () => {
      // Usamos dos steps: el constructor auto-confirma el primero (p1).
      // El segundo (p-extra) no está confirmado → debe devolver el breakdown raw.
      const stepConfirmado = makeStep({ productId: 'p1' });
      const stepNoConfirm = makeStep({ productId: 'p-extra' });
      const c = createComponent(makeOrder(), [stepConfirmado, stepNoConfirm]);
      const result = c.getMemberAllocations(stepNoConfirm);
      expect(result).toEqual(stepNoConfirm.memberBreakdown);
    });

    it('devuelve el breakdown sin modificar cuando el step no tiene sugerencias', () => {
      const stepSinSugerencias = makeStep({ suggestions: [] });
      // No importa si está confirmado: sin sugerencias siempre devuelve el breakdown raw
      component.onSelectPackOption('p1', 0);
      const result = component.getMemberAllocations(stepSinSugerencias);
      expect(result).toEqual(stepSinSugerencias.memberBreakdown);
    });

    it('ajusta proporcionalamente cuando el step está confirmado', () => {
      // p1 está auto-confirmado al iniciar (constructor effect)
      const step = makeStep({ suggestions: [makeSuggestion(20)] });
      const c = createComponent(makeOrder(), [step]);
      const result = c.getMemberAllocations(step);
      // qty: [10, 5] → proporcional sobre 20 unidades
      const total = result.reduce((sum: number, m: MemberQty) => sum + m.qty, 0);
      expect(total).toBe(20);
    });

    it('las cantidades proporcionales suman exactamente totalUnits (Largest Remainder)', () => {
      const step = makeStep({ suggestions: [makeSuggestion(30)] });
      const c = createComponent(makeOrder(), [step]);
      c.onSelectPackOption('p1', 0); // confirmamos con la primera sugerencia (30 unidades)
      const result = c.getMemberAllocations(step);
      const total = result.reduce((sum: number, m: MemberQty) => sum + m.qty, 0);
      expect(total).toBe(30);
    });

    it('devuelve el breakdown sin modificar cuando el índice seleccionado está fuera de rango', () => {
      // step confirmado, pero selections[p1] = 99 → suggestions[99] = undefined
      const step = makeStep({ suggestions: [makeSuggestion(20)] });
      const c = createComponent(makeOrder(), [step]);
      // Forzamos un índice fuera de rango directamente en el mapa interno
      const map = new Map(c.stepSelections());
      map.set('p1', 99);
      c.stepSelections.set(map);
      const result = c.getMemberAllocations(step);
      expect(result).toEqual(step.memberBreakdown);
    });
  });

  // ── _distributeProportionally (testado vía getMemberAllocations) ───────────

  describe('distributeProportionally (via getMemberAllocations)', () => {
    it('la suma de unidades asignadas es igual a totalUnits de la sugerencia', () => {
      const step = makeStep({ suggestions: [makeSuggestion(20)] });
      const c = createComponent(makeOrder(), [step]);
      const result = c.getMemberAllocations(step);
      const total = result.reduce((sum: number, m: MemberQty) => sum + m.qty, 0);
      expect(total).toBe(20);
    });

    it('cuando todas las cantidades son 0 devuelve todo a ceros', () => {
      const step = makeStep({
        suggestions: [makeSuggestion(20)],
        memberBreakdown: [
          { userId: 'u1', displayName: 'A', email: null, avatarUrl: null, qty: 0 },
          { userId: 'u2', displayName: 'B', email: null, avatarUrl: null, qty: 0 }
        ]
      });
      const c = createComponent(makeOrder(), [step]);
      // El step p1 ya está auto-confirmado
      const result = c.getMemberAllocations(step);
      for (const m of result) {
        expect(m.qty).toBe(0);
      }
    });
  });

  // ── onPrevStep / onNextStep ────────────────────────────────────────────────

  describe('onPrevStep y onNextStep', () => {
    it('no baja de 0 al llamar onPrevStep estando en el primer paso', () => {
      expect(component.currentStep()).toBe(0);
      component.onPrevStep();
      expect(component.currentStep()).toBe(0);
    });

    it('avanza al paso siguiente con onNextStep', () => {
      const step2 = makeStep({ productId: 'p2', productName: 'BoxB' });
      const c = createComponent(makeOrder(), [makeStep(), step2]);
      expect(c.currentStep()).toBe(0);
      c.onNextStep();
      expect(c.currentStep()).toBe(1);
    });

    it('no supera el último paso al llamar onNextStep repetidamente', () => {
      const steps = [makeStep(), makeStep({ productId: 'p2' })];
      const c = createComponent(makeOrder(), steps);
      c.onNextStep();
      c.onNextStep();
      c.onNextStep();
      expect(c.currentStep()).toBe(1); // máximo índice = length - 1
    });

    it('retrocede al paso anterior con onPrevStep', () => {
      const step2 = makeStep({ productId: 'p2', productName: 'BoxB' });
      const c = createComponent(makeOrder(), [makeStep(), step2]);
      c.onNextStep();
      expect(c.currentStep()).toBe(1);
      c.onPrevStep();
      expect(c.currentStep()).toBe(0);
    });

    it('no lanza error al navegar cuando packSteps está vacío', () => {
      const c = createComponent(makeOrder(), []);
      expect(() => c.onNextStep()).not.toThrow();
      expect(() => c.onPrevStep()).not.toThrow();
    });
  });

  // ── onSelectPackOption ─────────────────────────────────────────────────────

  describe('onSelectPackOption', () => {
    it('actualiza stepSelections con el índice indicado', () => {
      component.onSelectPackOption('p1', 1);
      expect(component.getStepSelection('p1')).toBe(1);
    });

    it('añade el productId al conjunto de selecciones confirmadas', () => {
      const stepNuevo = makeStep({ productId: 'p-nuevo' });
      const c = createComponent(makeOrder(), [makeStep(), stepNuevo]);
      // p-nuevo no debería estar confirmado aún
      c.onSelectPackOption('p-nuevo', 0);
      // Al confirmar, getMemberAllocations debería ajustar proporciones
      const result = c.getMemberAllocations(stepNuevo);
      const total = result.reduce((sum: number, m: MemberQty) => sum + m.qty, 0);
      expect(total).toBe(stepNuevo.suggestions[0].totalUnits);
    });

    it('llama a _ordersUseCases.updateLine para cada línea del step', async () => {
      component.onSelectPackOption('p1', 0);
      // Esperar a que se resuelva la promesa interna
      await new Promise((r) => setTimeout(r, 0));
      expect(mockUseCases.updateLine).toHaveBeenCalled();
    });

    it('no llama a updateLine cuando el productId no existe en packSteps', async () => {
      component.onSelectPackOption('producto-inexistente', 0);
      await new Promise((r) => setTimeout(r, 0));
      expect(mockUseCases.updateLine).not.toHaveBeenCalled();
    });

    it('no llama a updateLine cuando el índice de sugerencia está fuera de rango', async () => {
      component.onSelectPackOption('p1', 99);
      await new Promise((r) => setTimeout(r, 0));
      expect(mockUseCases.updateLine).not.toHaveBeenCalled();
    });
  });

  // ── allPacksSelectedChange output ──────────────────────────────────────────

  describe('allPacksSelectedChange output', () => {
    it('emite false inicialmente si sólo el primer step tiene sugerencias', () => {
      // Con un solo step y auto-confirm del constructor, debería emitir true
      // Verificamos el comportamiento con dos steps donde sólo el primero se auto-confirma
      const emittedValues: boolean[] = [];
      const step1 = makeStep({ productId: 'p1' });
      const step2 = makeStep({ productId: 'p2' });
      const fixture = TestBed.createComponent(OrderStepperComponent);
      fixture.componentRef.setInput('order', makeOrder());
      fixture.componentRef.setInput('packSteps', [step1, step2]);
      fixture.componentRef.setInput('editingHeader', false);
      const spy = vi.spyOn(fixture.componentInstance.allPacksSelectedChange, 'emit');
      fixture.detectChanges();
      // El último valor emitido debería ser false (p2 no está confirmado)
      const lastCall = spy.mock.calls[spy.mock.calls.length - 1];
      expect(lastCall[0]).toBe(false);
    });

    it('emite true cuando todos los steps con sugerencias están confirmados', () => {
      // Necesitamos espiar ANTES de detectChanges para capturar el emit del effect inicial.
      const fixture = TestBed.createComponent(OrderStepperComponent);
      const spy = vi.spyOn(fixture.componentInstance.allPacksSelectedChange, 'emit');
      fixture.componentRef.setInput('order', makeOrder());
      fixture.componentRef.setInput('packSteps', [makeStep()]);
      fixture.componentRef.setInput('editingHeader', false);
      fixture.detectChanges();
      // Con un único step (p1) y auto-confirmación del constructor, debe emitir true
      const calls = spy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(true);
    });

    it('emite true al confirmar manualmente el step que faltaba', () => {
      const step1 = makeStep({ productId: 'p1' });
      const step2 = makeStep({ productId: 'p2' });
      const fixture = TestBed.createComponent(OrderStepperComponent);
      fixture.componentRef.setInput('order', makeOrder());
      fixture.componentRef.setInput('packSteps', [step1, step2]);
      fixture.componentRef.setInput('editingHeader', false);
      const spy = vi.spyOn(fixture.componentInstance.allPacksSelectedChange, 'emit');
      fixture.detectChanges();

      fixture.componentInstance.onSelectPackOption('p2', 0);
      fixture.detectChanges();

      const lastCall = spy.mock.calls[spy.mock.calls.length - 1];
      expect(lastCall[0]).toBe(true);
    });
  });
});
