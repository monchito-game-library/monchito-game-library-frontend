import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { HardwareLoanFormComponent } from './hardware-loan-form.component';
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

describe('HardwareLoanFormComponent', () => {
  let component: HardwareLoanFormComponent;
  let fixture: ComponentFixture<HardwareLoanFormComponent>;

  const mockConsoleUseCases: Partial<ConsoleUseCasesContract> = {
    createLoan: vi.fn().mockResolvedValue('loan-uuid-1'),
    returnLoan: vi.fn().mockResolvedValue(undefined)
  };

  const mockControllerUseCases: Partial<ControllerUseCasesContract> = {
    createLoan: vi.fn().mockResolvedValue('loan-uuid-2'),
    returnLoan: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        HardwareLoanFormComponent,
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

    fixture = TestBed.createComponent(HardwareLoanFormComponent);
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
    it('inicializa loanedAt con la fecha de hoy en formato ISO', () => {
      fixture.detectChanges();
      const todayIso = new Date().toISOString().slice(0, 10);
      expect(component.form.getRawValue().loanedAt).toBe(todayIso);
    });

    it('loanedTo comienza vacío (null)', () => {
      fixture.detectChanges();
      expect(component.form.getRawValue().loanedTo).toBeNull();
    });
  });

  describe('estado inicial de señales', () => {
    it('saving comienza en false', () => {
      fixture.detectChanges();
      expect(component.saving()).toBe(false);
    });

    it('returning comienza en false', () => {
      fixture.detectChanges();
      expect(component.returning()).toBe(false);
    });
  });

  describe('isLoaned (computed)', () => {
    it('devuelve false cuando el item no tiene préstamo activo', () => {
      fixture.componentRef.setInput('item', makeConsole({ activeLoanId: null }));
      fixture.detectChanges();
      expect(component.isLoaned()).toBe(false);
    });

    it('devuelve true cuando el item tiene un préstamo activo', () => {
      fixture.componentRef.setInput('item', makeConsole({ activeLoanId: 'loan-uuid-1' }));
      fixture.detectChanges();
      expect(component.isLoaned()).toBe(true);
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

  describe('onLoan', () => {
    it('marca los campos como touched y no llama al use case si el formulario es inválido', async () => {
      fixture.detectChanges();
      component.form.patchValue({ loanedTo: null, loanedAt: null });

      await component.onLoan();

      expect(mockConsoleUseCases.createLoan).not.toHaveBeenCalled();
      expect(component.form.controls.loanedTo.touched).toBe(true);
    });

    it('llama a createLoan con los datos correctos cuando el formulario es válido', async () => {
      fixture.detectChanges();
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(mockConsoleUseCases.createLoan).toHaveBeenCalledWith(
        expect.objectContaining({
          userItemId: 'console-uuid-1',
          itemType: 'console',
          loanedTo: 'Juan',
          loanedAt: '2024-06-01'
        })
      );
    });

    it('emite saved con el item actualizado incluyendo el loanId devuelto', async () => {
      fixture.detectChanges();
      const savedSpy = vi.fn();
      component.saved.subscribe(savedSpy);
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(savedSpy).toHaveBeenCalledOnce();
      const emitted = savedSpy.mock.calls[0][0];
      expect(emitted.activeLoanId).toBe('loan-uuid-1');
      expect(emitted.activeLoanTo).toBe('Juan');
      expect(emitted.activeLoanAt).toBe('2024-06-01');
    });

    it('muestra snackbar de éxito tras crear el préstamo', async () => {
      fixture.detectChanges();
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('muestra snackbar de error si createLoan lanza', async () => {
      fixture.detectChanges();
      (mockConsoleUseCases.createLoan as any).mockRejectedValueOnce(new Error('loan error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva saving al finalizar aunque haya error', async () => {
      fixture.detectChanges();
      (mockConsoleUseCases.createLoan as any).mockRejectedValueOnce(new Error('fail'));
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(component.saving()).toBe(false);
    });

    it('usa el use case de controller cuando itemType es controller', async () => {
      fixture.componentRef.setInput('itemType', 'controller');
      fixture.detectChanges();
      component.form.patchValue({ loanedTo: 'Ana', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(mockControllerUseCases.createLoan).toHaveBeenCalled();
      expect(mockConsoleUseCases.createLoan).not.toHaveBeenCalled();
    });
  });

  describe('onReturn', () => {
    it('no llama al use case si el item no tiene préstamo activo', async () => {
      fixture.componentRef.setInput('item', makeConsole({ activeLoanId: null }));
      fixture.detectChanges();

      await component.onReturn();

      expect(mockConsoleUseCases.returnLoan).not.toHaveBeenCalled();
    });

    it('llama a returnLoan con los datos correctos cuando hay préstamo activo', async () => {
      fixture.componentRef.setInput('item', makeConsole({ activeLoanId: 'loan-uuid-1' }));
      fixture.detectChanges();

      await component.onReturn();

      expect(mockConsoleUseCases.returnLoan).toHaveBeenCalledWith('loan-uuid-1', 'console-uuid-1', 'user-1');
    });

    it('emite saved con activeLoanId null tras devolver el item', async () => {
      fixture.componentRef.setInput(
        'item',
        makeConsole({ activeLoanId: 'loan-uuid-1', activeLoanTo: 'Juan', activeLoanAt: '2024-06-01' })
      );
      fixture.detectChanges();
      const savedSpy = vi.fn();
      component.saved.subscribe(savedSpy);

      await component.onReturn();

      expect(savedSpy).toHaveBeenCalledOnce();
      const emitted = savedSpy.mock.calls[0][0];
      expect(emitted.activeLoanId).toBeNull();
      expect(emitted.activeLoanTo).toBeNull();
      expect(emitted.activeLoanAt).toBeNull();
    });

    it('muestra snackbar de éxito tras devolver el item', async () => {
      fixture.componentRef.setInput('item', makeConsole({ activeLoanId: 'loan-uuid-1' }));
      fixture.detectChanges();
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onReturn();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('muestra snackbar de error si returnLoan lanza', async () => {
      fixture.componentRef.setInput('item', makeConsole({ activeLoanId: 'loan-uuid-1' }));
      fixture.detectChanges();
      (mockConsoleUseCases.returnLoan as any).mockRejectedValueOnce(new Error('return error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onReturn();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva returning al finalizar aunque haya error', async () => {
      fixture.componentRef.setInput('item', makeConsole({ activeLoanId: 'loan-uuid-1' }));
      fixture.detectChanges();
      (mockConsoleUseCases.returnLoan as any).mockRejectedValueOnce(new Error('fail'));

      await component.onReturn();

      expect(component.returning()).toBe(false);
    });

    it('usa el use case de controller cuando itemType es controller', async () => {
      fixture.componentRef.setInput('item', makeConsole({ activeLoanId: 'loan-uuid-1' }));
      fixture.componentRef.setInput('itemType', 'controller');
      fixture.detectChanges();

      await component.onReturn();

      expect(mockControllerUseCases.returnLoan).toHaveBeenCalled();
      expect(mockConsoleUseCases.returnLoan).not.toHaveBeenCalled();
    });
  });
});
