import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { HardwareSaleFormComponent } from './hardware-sale-form.component';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ConsoleModel } from '@/models/console/console.model';

function makeConsole(overrides: Partial<ConsoleModel> = {}): ConsoleModel {
  return {
    id: 'console-uuid-1',
    userId: 'user-1',
    brandId: 'brand-uuid-1',
    modelId: 'model-uuid-1',
    editionId: null,
    region: null,
    condition: 'new',
    price: 299,
    store: null,
    purchaseDate: null,
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    forSale: false,
    salePrice: null,
    soldAt: null,
    soldPriceFinal: null,
    activeLoanId: null,
    activeLoanTo: null,
    activeLoanAt: null,
    ...overrides
  };
}

describe('HardwareSaleFormComponent', () => {
  let component: HardwareSaleFormComponent;
  let fixture: ComponentFixture<HardwareSaleFormComponent>;

  const mockConsoleUseCases: Partial<ConsoleUseCasesContract> = {
    updateSaleStatus: vi.fn().mockResolvedValue(undefined)
  };

  const mockControllerUseCases: Partial<ControllerUseCasesContract> = {
    updateSaleStatus: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        HardwareSaleFormComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        { provide: CONSOLE_USE_CASES, useValue: mockConsoleUseCases },
        { provide: CONTROLLER_USE_CASES, useValue: mockControllerUseCases },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(HardwareSaleFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', makeConsole());
    fixture.componentRef.setInput('itemType', 'console');
  });

  describe('creación del componente', () => {
    it('se crea correctamente', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('inicializa el formulario con los valores del item', () => {
      const consoleItem = makeConsole({ forSale: true, salePrice: 150, soldAt: '2024-06-01', soldPriceFinal: 130 });
      fixture.componentRef.setInput('item', consoleItem);
      fixture.detectChanges();

      expect(component.form.getRawValue().forSale).toBe(true);
      expect(component.form.getRawValue().salePrice).toBe(150);
      expect(component.form.getRawValue().soldAt).toBe('2024-06-01');
      expect(component.form.getRawValue().soldPriceFinal).toBe(130);
    });

    it('inicializa forSale a false cuando el item no está en venta', () => {
      fixture.detectChanges();
      expect(component.form.getRawValue().forSale).toBe(false);
    });
  });

  describe('estado inicial de señales', () => {
    it('saving comienza en false', () => {
      fixture.detectChanges();
      expect(component.saving()).toBe(false);
    });

    it('selling comienza en false', () => {
      fixture.detectChanges();
      expect(component.selling()).toBe(false);
    });
  });

  describe('isForSale (getter)', () => {
    it('devuelve false cuando el toggle está desactivado', () => {
      fixture.detectChanges();
      component.form.controls.forSale.setValue(false);
      expect(component.isForSale).toBe(false);
    });

    it('devuelve true cuando el toggle está activado', () => {
      fixture.detectChanges();
      component.form.controls.forSale.setValue(true);
      expect(component.isForSale).toBe(true);
    });
  });

  describe('canMarkAsSold (getter)', () => {
    it('devuelve false cuando soldPriceFinal es null', () => {
      fixture.detectChanges();
      component.form.patchValue({ soldPriceFinal: null, soldAt: '2024-06-01' });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve false cuando soldPriceFinal es 0', () => {
      fixture.detectChanges();
      component.form.patchValue({ soldPriceFinal: 0, soldAt: '2024-06-01' });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve false cuando soldAt es null', () => {
      fixture.detectChanges();
      component.form.patchValue({ soldPriceFinal: 100, soldAt: null });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve true cuando soldPriceFinal > 0 y soldAt válido están presentes', () => {
      fixture.detectChanges();
      component.form.patchValue({ soldPriceFinal: 100, soldAt: '2024-06-01' });
      expect(component.canMarkAsSold).toBe(true);
    });

    it('devuelve false cuando la fecha soldAt es inválida', () => {
      fixture.detectChanges();
      component.form.patchValue({ soldPriceFinal: 100, soldAt: 'fecha-invalida' });
      expect(component.canMarkAsSold).toBe(false);
    });
  });

  describe('onCancel', () => {
    it('emite el evento cancelled', () => {
      fixture.detectChanges();
      const cancelledSpy = vi.fn();
      component.cancelled.subscribe(cancelledSpy);

      component.onCancel();

      expect(cancelledSpy).toHaveBeenCalledOnce();
    });
  });

  describe('onSave', () => {
    it('llama a updateSaleStatus del use case correcto con los valores del formulario', async () => {
      fixture.detectChanges();
      component.form.patchValue({ forSale: true, salePrice: 100 });

      await component.onSave();

      expect(mockConsoleUseCases.updateSaleStatus).toHaveBeenCalledWith(
        'user-1',
        'console-uuid-1',
        expect.objectContaining({ forSale: true, salePrice: 100 })
      );
    });

    it('emite saved con el item actualizado tras guardar correctamente', async () => {
      fixture.detectChanges();
      const savedSpy = vi.fn();
      component.saved.subscribe(savedSpy);
      component.form.patchValue({ forSale: true, salePrice: 120 });

      await component.onSave();

      expect(savedSpy).toHaveBeenCalledOnce();
      expect(savedSpy.mock.calls[0][0].forSale).toBe(true);
    });

    it('muestra snackbar de éxito tras guardar', async () => {
      fixture.detectChanges();
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onSave();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('muestra snackbar de error si updateSaleStatus lanza', async () => {
      fixture.detectChanges();
      (mockConsoleUseCases.updateSaleStatus as any).mockRejectedValueOnce(new Error('save error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onSave();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva saving al finalizar aunque haya error', async () => {
      fixture.detectChanges();
      (mockConsoleUseCases.updateSaleStatus as any).mockRejectedValueOnce(new Error('fail'));

      await component.onSave();

      expect(component.saving()).toBe(false);
    });

    it('usa el use case de controller cuando itemType es controller', async () => {
      fixture.componentRef.setInput('itemType', 'controller');
      fixture.detectChanges();

      await component.onSave();

      expect(mockControllerUseCases.updateSaleStatus).toHaveBeenCalled();
      expect(mockConsoleUseCases.updateSaleStatus).not.toHaveBeenCalled();
    });

    it('cuando forSale es false pone salePrice a null en el payload', async () => {
      fixture.detectChanges();
      component.form.patchValue({ forSale: false, salePrice: 999 });

      await component.onSave();

      expect(mockConsoleUseCases.updateSaleStatus).toHaveBeenCalledWith(
        'user-1',
        'console-uuid-1',
        expect.objectContaining({ forSale: false, salePrice: null })
      );
    });
  });

  describe('onMarkAsSold', () => {
    it('no llama al use case si canMarkAsSold es false', async () => {
      fixture.detectChanges();
      component.form.patchValue({ soldPriceFinal: null, soldAt: null });

      await component.onMarkAsSold();

      expect(mockConsoleUseCases.updateSaleStatus).not.toHaveBeenCalled();
    });

    it('llama a updateSaleStatus con forSale false y salePrice null cuando la venta es válida', async () => {
      fixture.detectChanges();
      component.form.patchValue({ soldPriceFinal: 200, soldAt: '2024-06-15' });

      await component.onMarkAsSold();

      expect(mockConsoleUseCases.updateSaleStatus).toHaveBeenCalledWith(
        'user-1',
        'console-uuid-1',
        expect.objectContaining({ forSale: false, salePrice: null, soldAt: '2024-06-15', soldPriceFinal: 200 })
      );
    });

    it('emite saved con el item actualizado tras marcar como vendido', async () => {
      fixture.detectChanges();
      const savedSpy = vi.fn();
      component.saved.subscribe(savedSpy);
      component.form.patchValue({ soldPriceFinal: 200, soldAt: '2024-06-15' });

      await component.onMarkAsSold();

      expect(savedSpy).toHaveBeenCalledOnce();
      expect(savedSpy.mock.calls[0][0].soldAt).toBe('2024-06-15');
    });

    it('muestra snackbar de éxito tras marcar como vendido', async () => {
      fixture.detectChanges();
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      component.form.patchValue({ soldPriceFinal: 200, soldAt: '2024-06-15' });

      await component.onMarkAsSold();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('muestra snackbar de error y desactiva selling si updateSaleStatus lanza', async () => {
      fixture.detectChanges();
      (mockConsoleUseCases.updateSaleStatus as any).mockRejectedValueOnce(new Error('sold error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      component.form.patchValue({ soldPriceFinal: 200, soldAt: '2024-06-15' });

      await component.onMarkAsSold();

      expect(snackBar.open).toHaveBeenCalled();
      expect(component.selling()).toBe(false);
    });
  });
});
