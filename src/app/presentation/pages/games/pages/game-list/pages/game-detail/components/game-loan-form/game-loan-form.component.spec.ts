import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GameLoanFormComponent } from './game-loan-form.component';
import { GameEditModel } from '@/models/game/game-edit.model';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';

function makeGame(overrides: Partial<GameEditModel> = {}): GameEditModel {
  return {
    uuid: 'game-uuid-1',
    id: 1,
    title: 'God of War',
    price: 49.99,
    store: 'store-uuid-1',
    platform: 'PS5',
    condition: 'new',
    platinum: false,
    description: 'Notas del juego',
    status: 'playing',
    personalRating: 8,
    edition: null,
    format: 'physical',
    isFavorite: false,
    imageUrl: 'https://example.com/gow.jpg',
    rawgId: 58175,
    rawgSlug: 'god-of-war',
    releasedDate: '2018-04-20',
    rawgRating: 4.42,
    genres: ['Action', 'Adventure'],
    coverPosition: null,
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

@Component({
  template: '<app-game-loan-form [game]="game" (saved)="onSaved($event)" (cancelled)="onCancelled()" />',
  standalone: true,
  imports: [GameLoanFormComponent]
})
class TestHostComponent {
  game = makeGame();
  onSaved = vi.fn();
  onCancelled = vi.fn();
}

describe('GameLoanFormComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: GameLoanFormComponent;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        {
          provide: GAME_USE_CASES,
          useValue: {
            createLoan: vi.fn().mockResolvedValue('loan-uuid-1'),
            returnLoan: vi.fn().mockResolvedValue(undefined)
          } as Partial<GameUseCasesContract>
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    component = hostFixture.debugElement.query(By.directive(GameLoanFormComponent))
      .componentInstance as GameLoanFormComponent;
  });

  describe('isLoaned (computed)', () => {
    it('devuelve false cuando activeLoanId es null', () => {
      expect(component.isLoaned()).toBe(false);
    });

    it('devuelve true cuando activeLoanId tiene valor', () => {
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;

      expect(child.isLoaned()).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('parchea la fecha de préstamo con el día de hoy', () => {
      expect(component.form.controls.loanedAt.value).toBe(component.todayIso);
    });
  });

  describe('onCancel', () => {
    it('emite el evento cancelled', () => {
      component.onCancel();
      expect(hostComponent.onCancelled).toHaveBeenCalled();
    });
  });

  describe('onLoan', () => {
    it('no llama a createLoan si el formulario es inválido', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      component.form.patchValue({ loanedTo: null, loanedAt: null });

      await component.onLoan();

      expect(gameUseCases.createLoan).not.toHaveBeenCalled();
    });

    it('llama a createLoan con los datos del formulario', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(gameUseCases.createLoan).toHaveBeenCalledWith({
        userGameId: 'game-uuid-1',
        loanedTo: 'Juan',
        loanedAt: '2024-06-01'
      });
    });

    it('emite saved con el modelo actualizado tras crear el préstamo', async () => {
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(hostComponent.onSaved).toHaveBeenCalledWith(
        expect.objectContaining({ activeLoanId: 'loan-uuid-1', activeLoanTo: 'Juan', activeLoanAt: '2024-06-01' })
      );
    });

    it('muestra snackbar de éxito tras crear el préstamo', async () => {
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('activa la señal saving durante la operación', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      let savingDuringCall = false;
      gameUseCases.createLoan.mockImplementation(async () => {
        savingDuringCall = component.saving();
        return 'loan-uuid-1';
      });
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(savingDuringCall).toBe(true);
    });

    it('desactiva la señal saving tras la operación exitosa', async () => {
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(component.saving()).toBe(false);
    });

    it('muestra snackbar de error si createLoan lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.createLoan.mockRejectedValue(new Error('loan error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva la señal saving si createLoan lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.createLoan.mockRejectedValue(new Error('loan error'));
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(component.saving()).toBe(false);
    });

    it('no emite saved si createLoan lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.createLoan.mockRejectedValue(new Error('loan error'));
      component.form.patchValue({ loanedTo: 'Juan', loanedAt: '2024-06-01' });

      await component.onLoan();

      expect(hostComponent.onSaved).not.toHaveBeenCalled();
    });
  });

  describe('onReturn', () => {
    it('no llama a returnLoan si activeLoanId es null', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;

      await component.onReturn();

      expect(gameUseCases.returnLoan).not.toHaveBeenCalled();
    });

    it('llama a returnLoan con el loanId del juego', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;

      await child.onReturn();

      expect(gameUseCases.returnLoan).toHaveBeenCalledWith('loan-1');
    });

    it('emite saved con activeLoanId/To/At nulos tras la devolución', async () => {
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;
      const hostChild = newHostFixture.componentInstance;

      await child.onReturn();

      expect(hostChild.onSaved).toHaveBeenCalledWith(
        expect.objectContaining({ activeLoanId: null, activeLoanTo: null, activeLoanAt: null })
      );
    });

    it('muestra snackbar de éxito tras la devolución', async () => {
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;

      await child.onReturn();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('activa la señal returning durante la operación', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;
      let returningDuringCall = false;
      gameUseCases.returnLoan.mockImplementation(async () => {
        returningDuringCall = child.returning();
      });

      await child.onReturn();

      expect(returningDuringCall).toBe(true);
    });

    it('desactiva la señal returning tras la operación exitosa', async () => {
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;

      await child.onReturn();

      expect(child.returning()).toBe(false);
    });

    it('muestra snackbar de error si returnLoan lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.returnLoan.mockRejectedValue(new Error('return error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;

      await child.onReturn();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva la señal returning si returnLoan lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.returnLoan.mockRejectedValue(new Error('return error'));
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;

      await child.onReturn();

      expect(child.returning()).toBe(false);
    });

    it('no emite saved si returnLoan lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.returnLoan.mockRejectedValue(new Error('return error'));
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = makeGame({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameLoanFormComponent))
        .componentInstance as GameLoanFormComponent;
      const hostChild = newHostFixture.componentInstance;

      await child.onReturn();

      expect(hostChild.onSaved).not.toHaveBeenCalled();
    });
  });
});
