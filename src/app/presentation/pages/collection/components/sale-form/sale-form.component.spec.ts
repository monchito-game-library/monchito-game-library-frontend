import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { SaleFormComponent } from './sale-form.component';
import { SaleFormInitialValues } from '@/interfaces/forms/sale-form.interface';

const PREFIX = 'gameDetail.sale';

function makeInitialValues(overrides: Partial<SaleFormInitialValues> = {}): SaleFormInitialValues {
  return { forSale: false, salePrice: null, soldPriceFinal: null, soldAt: null, ...overrides };
}

describe('SaleFormComponent', () => {
  let component: SaleFormComponent;
  let fixture: ComponentFixture<SaleFormComponent>;
  let mockSaveFn: ReturnType<typeof vi.fn>;
  let mockSellFn: ReturnType<typeof vi.fn>;
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveFn = vi.fn().mockResolvedValue(undefined);
    mockSellFn = vi.fn().mockResolvedValue(undefined);
    snackBar = { open: vi.fn() };

    TestBed.configureTestingModule({
      imports: [
        SaleFormComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [provideNativeDateAdapter(), { provide: MatSnackBar, useValue: snackBar }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(SaleFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialValues', makeInitialValues());
    fixture.componentRef.setInput('i18nPrefix', PREFIX);
    fixture.componentRef.setInput('saveFn', mockSaveFn);
    fixture.componentRef.setInput('sellFn', mockSellFn);
    fixture.detectChanges();
  });

  describe('creación del componente', () => {
    it('se crea correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('inicializa el formulario con los valores recibidos', () => {
      const iv = makeInitialValues({ forSale: true, salePrice: 50, soldAt: '2024-06-01', soldPriceFinal: 45 });
      const f = TestBed.createComponent(SaleFormComponent);
      f.componentRef.setInput('initialValues', iv);
      f.componentRef.setInput('i18nPrefix', PREFIX);
      f.componentRef.setInput('saveFn', mockSaveFn);
      f.componentRef.setInput('sellFn', mockSellFn);
      f.detectChanges();

      const raw = f.componentInstance.form.getRawValue();
      expect(raw.forSale).toBe(true);
      expect(raw.salePrice).toBe(50);
      expect(raw.soldAt).toEqual(new Date('2024-06-01T00:00:00'));
      expect(raw.soldPriceFinal).toBe(45);
    });
  });

  describe('estado inicial de señales', () => {
    it('saving comienza en false', () => {
      expect(component.saving()).toBe(false);
    });

    it('selling comienza en false', () => {
      expect(component.selling()).toBe(false);
    });
  });

  describe('isForSale (getter)', () => {
    it('devuelve false cuando el toggle está desactivado', () => {
      component.form.controls.forSale.setValue(false);
      expect(component.isForSale).toBe(false);
    });

    it('devuelve true cuando el toggle está activado', () => {
      component.form.controls.forSale.setValue(true);
      expect(component.isForSale).toBe(true);
    });
  });

  describe('canMarkAsSold (getter)', () => {
    it('devuelve false cuando soldPriceFinal es null', () => {
      component.form.patchValue({ soldPriceFinal: null, soldAt: new Date('2024-06-01T00:00:00') });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve false cuando soldPriceFinal es 0', () => {
      component.form.patchValue({ soldPriceFinal: 0, soldAt: new Date('2024-06-01T00:00:00') });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve false cuando soldAt es null', () => {
      component.form.patchValue({ soldPriceFinal: 100, soldAt: null as unknown as Date });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve true cuando soldPriceFinal > 0 y soldAt válido', () => {
      component.form.patchValue({ soldPriceFinal: 100, soldAt: new Date('2024-06-01T00:00:00') });
      expect(component.canMarkAsSold).toBe(true);
    });

    it('devuelve false cuando soldAt es inválido', () => {
      component.form.patchValue({ soldPriceFinal: 100, soldAt: new Date('invalid') });
      expect(component.canMarkAsSold).toBe(false);
    });
  });

  describe('onCancel', () => {
    it('emite el evento cancelled', () => {
      const spy = vi.fn();
      component.cancelled.subscribe(spy);
      component.onCancel();
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('onSave', () => {
    it('llama a saveFn con forSale y salePrice del formulario', async () => {
      component.form.patchValue({ forSale: true, salePrice: 80 });
      await component.onSave();
      expect(mockSaveFn).toHaveBeenCalledWith({ forSale: true, salePrice: 80 });
    });

    it('pone salePrice a null cuando forSale es false', async () => {
      component.form.patchValue({ forSale: false, salePrice: 80 });
      await component.onSave();
      expect(mockSaveFn).toHaveBeenCalledWith({ forSale: false, salePrice: null });
    });

    it('pone salePrice a null cuando forSale es true pero salePrice es null', async () => {
      component.form.patchValue({ forSale: true, salePrice: null });
      await component.onSave();
      expect(mockSaveFn).toHaveBeenCalledWith({ forSale: true, salePrice: null });
    });

    it('emite saveCompleted con los valores de disponibilidad tras éxito', async () => {
      const spy = vi.fn();
      component.saveCompleted.subscribe(spy);
      component.form.patchValue({ forSale: true, salePrice: 80 });
      await component.onSave();
      expect(spy).toHaveBeenCalledWith({ forSale: true, salePrice: 80 });
    });

    it('muestra snackbar de éxito tras guardar', async () => {
      await component.onSave();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('activa saving durante la operación', async () => {
      let savingDuringCall = false;
      mockSaveFn.mockImplementation(async () => {
        savingDuringCall = component.saving();
      });
      await component.onSave();
      expect(savingDuringCall).toBe(true);
    });

    it('desactiva saving tras éxito', async () => {
      await component.onSave();
      expect(component.saving()).toBe(false);
    });

    it('muestra snackbar de error si saveFn lanza', async () => {
      mockSaveFn.mockRejectedValueOnce(new Error('fail'));
      await component.onSave();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva saving si saveFn lanza', async () => {
      mockSaveFn.mockRejectedValueOnce(new Error('fail'));
      await component.onSave();
      expect(component.saving()).toBe(false);
    });

    it('no emite saveCompleted si saveFn lanza', async () => {
      const spy = vi.fn();
      component.saveCompleted.subscribe(spy);
      mockSaveFn.mockRejectedValueOnce(new Error('fail'));
      await component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onMarkAsSold', () => {
    it('no llama a sellFn si canMarkAsSold es false', async () => {
      component.form.patchValue({ soldPriceFinal: null, soldAt: null as unknown as Date });
      await component.onMarkAsSold();
      expect(mockSellFn).not.toHaveBeenCalled();
    });

    it('llama a sellFn con soldAt y soldPriceFinal del formulario', async () => {
      component.form.patchValue({ soldPriceFinal: 200, soldAt: new Date('2024-06-15T00:00:00') });
      await component.onMarkAsSold();
      expect(mockSellFn).toHaveBeenCalledWith({ soldAt: '2024-06-15', soldPriceFinal: 200 });
    });

    it('emite sellCompleted tras éxito', async () => {
      const spy = vi.fn();
      component.sellCompleted.subscribe(spy);
      component.form.patchValue({ soldPriceFinal: 200, soldAt: new Date('2024-06-15T00:00:00') });
      await component.onMarkAsSold();
      expect(spy).toHaveBeenCalledWith({ soldAt: '2024-06-15', soldPriceFinal: 200 });
    });

    it('muestra snackbar de éxito tras marcar como vendido', async () => {
      component.form.patchValue({ soldPriceFinal: 200, soldAt: new Date('2024-06-15T00:00:00') });
      await component.onMarkAsSold();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('activa selling durante la operación', async () => {
      let sellingDuringCall = false;
      mockSellFn.mockImplementation(async () => {
        sellingDuringCall = component.selling();
      });
      component.form.patchValue({ soldPriceFinal: 200, soldAt: new Date('2024-06-15T00:00:00') });
      await component.onMarkAsSold();
      expect(sellingDuringCall).toBe(true);
    });

    it('muestra snackbar de error y desactiva selling si sellFn lanza', async () => {
      mockSellFn.mockRejectedValueOnce(new Error('fail'));
      component.form.patchValue({ soldPriceFinal: 200, soldAt: new Date('2024-06-15T00:00:00') });
      await component.onMarkAsSold();
      expect(snackBar.open).toHaveBeenCalled();
      expect(component.selling()).toBe(false);
    });

    it('no emite sellCompleted si sellFn lanza', async () => {
      const spy = vi.fn();
      component.sellCompleted.subscribe(spy);
      mockSellFn.mockRejectedValueOnce(new Error('fail'));
      component.form.patchValue({ soldPriceFinal: 200, soldAt: new Date('2024-06-15T00:00:00') });
      await component.onMarkAsSold();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
