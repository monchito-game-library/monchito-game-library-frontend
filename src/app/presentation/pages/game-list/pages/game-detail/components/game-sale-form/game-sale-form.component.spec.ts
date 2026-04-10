import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GameSaleFormComponent } from './game-sale-form.component';
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
  template: '<app-game-sale-form [game]="game" (saved)="onSaved($event)" (cancelled)="onCancelled()" />',
  standalone: true,
  imports: [GameSaleFormComponent]
})
class TestHostComponent {
  game = makeGame();
  onSaved = vi.fn();
  onCancelled = vi.fn();
}

describe('GameSaleFormComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: GameSaleFormComponent;

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
            updateSaleStatus: vi.fn().mockResolvedValue(undefined)
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
    component = hostFixture.debugElement.query(By.directive(GameSaleFormComponent))
      .componentInstance as GameSaleFormComponent;
  });

  describe('ngOnInit', () => {
    it('parchea el formulario con los valores del juego recibido', () => {
      const gameWithSale = makeGame({ forSale: true, salePrice: 30, soldAt: '2024-01-15', soldPriceFinal: 28 });

      // Recrear el host con el juego con datos de venta
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = gameWithSale;
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameSaleFormComponent))
        .componentInstance as GameSaleFormComponent;

      expect(child.form.controls.forSale.value).toBe(true);
      expect(child.form.controls.salePrice.value).toBe(30);
      expect(child.form.controls.soldAt.value).toBe('2024-01-15');
      expect(child.form.controls.soldPriceFinal.value).toBe(28);
    });

    it('parchea el formulario con valores nulos cuando el juego no tiene datos de venta', () => {
      component.ngOnInit();

      expect(component.form.controls.forSale.value).toBe(false);
      expect(component.form.controls.salePrice.value).toBeNull();
      expect(component.form.controls.soldAt.value).toBeNull();
      expect(component.form.controls.soldPriceFinal.value).toBeNull();
    });
  });

  describe('isForSale (getter)', () => {
    it('devuelve false cuando forSale está desactivado', () => {
      component.form.controls.forSale.setValue(false);
      expect(component.isForSale).toBe(false);
    });

    it('devuelve true cuando forSale está activado', () => {
      component.form.controls.forSale.setValue(true);
      expect(component.isForSale).toBe(true);
    });
  });

  describe('canMarkAsSold (getter)', () => {
    it('devuelve false cuando soldPriceFinal y soldAt son nulos', () => {
      component.form.patchValue({ soldPriceFinal: null, soldAt: null });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve false cuando soldPriceFinal es 0', () => {
      component.form.patchValue({ soldPriceFinal: 0, soldAt: '2024-01-15' });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve false cuando soldPriceFinal es mayor que 0 pero soldAt está vacío', () => {
      component.form.patchValue({ soldPriceFinal: 25, soldAt: null });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve false cuando soldAt tiene valor pero soldPriceFinal es nulo', () => {
      component.form.patchValue({ soldPriceFinal: null, soldAt: '2024-01-15' });
      expect(component.canMarkAsSold).toBe(false);
    });

    it('devuelve true cuando soldPriceFinal > 0 y soldAt no está vacío', () => {
      component.form.patchValue({ soldPriceFinal: 25, soldAt: '2024-01-15' });
      expect(component.canMarkAsSold).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('emite el evento cancelled', () => {
      component.onCancel();
      expect(hostComponent.onCancelled).toHaveBeenCalled();
    });
  });

  describe('onSave', () => {
    it('llama a updateSaleStatus con los datos correctos', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      component.form.patchValue({ forSale: true, salePrice: 30 });

      await component.onSave();

      expect(gameUseCases.updateSaleStatus).toHaveBeenCalledWith(
        'user-1',
        'game-uuid-1',
        expect.objectContaining({ forSale: true, salePrice: 30 })
      );
    });

    it('emite el evento saved con el modelo actualizado tras guardar correctamente', async () => {
      component.form.patchValue({ forSale: true, salePrice: 30 });

      await component.onSave();

      expect(hostComponent.onSaved).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'game-uuid-1', forSale: true, salePrice: 30 })
      );
    });

    it('muestra snackbar de éxito tras guardar correctamente', async () => {
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onSave();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('activa la señal saving durante la operación', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      let savingDuringCall = false;
      gameUseCases.updateSaleStatus.mockImplementation(async () => {
        savingDuringCall = component.saving();
      });

      await component.onSave();

      expect(savingDuringCall).toBe(true);
    });

    it('desactiva la señal saving tras la operación exitosa', async () => {
      await component.onSave();
      expect(component.saving()).toBe(false);
    });

    it('muestra snackbar de error si updateSaleStatus lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.updateSaleStatus.mockRejectedValue(new Error('save error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onSave();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva la señal saving aunque updateSaleStatus lanze', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.updateSaleStatus.mockRejectedValue(new Error('save error'));

      await component.onSave();

      expect(component.saving()).toBe(false);
    });

    it('no emite saved si updateSaleStatus lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.updateSaleStatus.mockRejectedValue(new Error('save error'));

      await component.onSave();

      expect(hostComponent.onSaved).not.toHaveBeenCalled();
    });

    it('preserva los valores soldAt y soldPriceFinal del juego original aunque el formulario los cambie', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const gameWithSold = makeGame({ soldAt: '2024-01-01', soldPriceFinal: 20 });

      // Crear un nuevo host con el juego que ya tiene datos de venta
      const newHostFixture = TestBed.createComponent(TestHostComponent);
      newHostFixture.componentInstance.game = gameWithSold;
      newHostFixture.detectChanges();
      const child = newHostFixture.debugElement.query(By.directive(GameSaleFormComponent))
        .componentInstance as GameSaleFormComponent;

      child.form.patchValue({ forSale: true, salePrice: 35 });

      await child.onSave();

      expect(gameUseCases.updateSaleStatus).toHaveBeenCalledWith(
        'user-1',
        'game-uuid-1',
        expect.objectContaining({ soldAt: '2024-01-01', soldPriceFinal: 20 })
      );
    });

    it('establece salePrice a null cuando forSale es false', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      component.form.patchValue({ forSale: false, salePrice: 30 });

      await component.onSave();

      expect(gameUseCases.updateSaleStatus).toHaveBeenCalledWith(
        'user-1',
        'game-uuid-1',
        expect.objectContaining({ salePrice: null })
      );
    });
  });

  describe('onMarkAsSold', () => {
    it('no llama a updateSaleStatus si canMarkAsSold es false', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      component.form.patchValue({ soldPriceFinal: null, soldAt: null });

      await component.onMarkAsSold();

      expect(gameUseCases.updateSaleStatus).not.toHaveBeenCalled();
    });

    it('llama a updateSaleStatus con forSale false y salePrice null', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      component.form.patchValue({ soldPriceFinal: 25, soldAt: '2024-06-01' });

      await component.onMarkAsSold();

      expect(gameUseCases.updateSaleStatus).toHaveBeenCalledWith(
        'user-1',
        'game-uuid-1',
        expect.objectContaining({ forSale: false, salePrice: null, soldAt: '2024-06-01', soldPriceFinal: 25 })
      );
    });

    it('emite el evento saved con el modelo actualizado tras registrar la venta', async () => {
      component.form.patchValue({ soldPriceFinal: 25, soldAt: '2024-06-01' });

      await component.onMarkAsSold();

      expect(hostComponent.onSaved).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'game-uuid-1', forSale: false, salePrice: null })
      );
    });

    it('activa la señal selling durante la operación', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      let sellingDuringCall = false;
      gameUseCases.updateSaleStatus.mockImplementation(async () => {
        sellingDuringCall = component.selling();
      });
      component.form.patchValue({ soldPriceFinal: 25, soldAt: '2024-06-01' });

      await component.onMarkAsSold();

      expect(sellingDuringCall).toBe(true);
    });

    it('muestra snackbar de éxito tras registrar la venta', async () => {
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      component.form.patchValue({ soldPriceFinal: 25, soldAt: '2024-06-01' });

      await component.onMarkAsSold();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('muestra snackbar de error si updateSaleStatus lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.updateSaleStatus.mockRejectedValue(new Error('sold error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      component.form.patchValue({ soldPriceFinal: 25, soldAt: '2024-06-01' });

      await component.onMarkAsSold();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva la señal selling si updateSaleStatus lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.updateSaleStatus.mockRejectedValue(new Error('sold error'));
      component.form.patchValue({ soldPriceFinal: 25, soldAt: '2024-06-01' });

      await component.onMarkAsSold();

      expect(component.selling()).toBe(false);
    });

    it('no emite saved si updateSaleStatus lanza', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.updateSaleStatus.mockRejectedValue(new Error('sold error'));
      component.form.patchValue({ soldPriceFinal: 25, soldAt: '2024-06-01' });

      await component.onMarkAsSold();

      expect(hostComponent.onSaved).not.toHaveBeenCalled();
    });
  });
});
