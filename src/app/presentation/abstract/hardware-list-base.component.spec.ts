import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { HardwareListBaseComponent } from './hardware-list-base.component';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { GAME_CONDITION } from '@/constants/game-condition.constant';

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'test-hardware-list', template: '', standalone: true })
class TestHardwareListComponent extends HardwareListBaseComponent {
  protected readonly _listRoute = '/test/add';
  protected readonly _detailRoute = '/test/detail';
  async ngOnInit(): Promise<void> {}
}

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockStoreUseCases = { getAllStores: vi.fn() };
const mockBrandUseCases = { getAll: vi.fn() };
const mockModelUseCases = { getAllByType: vi.fn() };
const mockUserContext = { requireUserId: vi.fn().mockReturnValue('user-1') };

describe('HardwareListBaseComponent', () => {
  let component: TestHardwareListComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TestHardwareListComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: STORE_USE_CASES, useValue: mockStoreUseCases },
        { provide: HARDWARE_BRAND_USE_CASES, useValue: mockBrandUseCases },
        { provide: HARDWARE_MODEL_USE_CASES, useValue: mockModelUseCases },
        { provide: UserContextService, useValue: mockUserContext }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    component = TestBed.createComponent(TestHardwareListComponent).componentInstance;
  });

  describe('estado inicial', () => {
    it('searchQuery empieza en cadena vacía', () => {
      expect(component.searchQuery()).toBe('');
    });

    it('loading empieza en true', () => {
      expect(component.loading()).toBe(true);
    });

    it('GAME_CONDITION está definido', () => {
      expect(component.GAME_CONDITION).toBeDefined();
      expect(component.GAME_CONDITION).toEqual(GAME_CONDITION);
    });
  });

  describe('resolveStoreName', () => {
    it('devuelve cadena vacía cuando id es null', () => {
      expect(component.resolveStoreName(null)).toBe('');
    });

    it('devuelve el id como fallback cuando no se encuentra la tienda', () => {
      (component as any)._stores.set([]);
      expect(component.resolveStoreName('unknown-id')).toBe('unknown-id');
    });

    it('devuelve el label de la tienda cuando el id es conocido', () => {
      (component as any)._stores.set([{ id: 'store-1', label: 'My Store' }]);
      expect(component.resolveStoreName('store-1')).toBe('My Store');
    });
  });

  describe('resolveBrandName', () => {
    it('devuelve guión cuando id es null', () => {
      expect(component.resolveBrandName(null)).toBe('—');
    });

    it('devuelve guión cuando el id no coincide con ninguna marca', () => {
      (component as any)._brands.set([]);
      expect(component.resolveBrandName('unknown-id')).toBe('—');
    });

    it('devuelve el nombre de la marca cuando el id es conocido', () => {
      (component as any)._brands.set([{ id: 'brand-1', name: 'Nintendo' }]);
      expect(component.resolveBrandName('brand-1')).toBe('Nintendo');
    });
  });

  describe('resolveModelName', () => {
    it('devuelve guión cuando id es null', () => {
      expect(component.resolveModelName(null)).toBe('—');
    });

    it('devuelve guión cuando el id no coincide con ningún modelo', () => {
      (component as any)._hardwareModels.set([]);
      expect(component.resolveModelName('unknown-id')).toBe('—');
    });

    it('devuelve el nombre del modelo cuando el id es conocido', () => {
      (component as any)._hardwareModels.set([{ id: 'model-1', name: 'SNES' }]);
      expect(component.resolveModelName('model-1')).toBe('SNES');
    });
  });

  describe('onAdd', () => {
    it('navega a la ruta de añadir del componente concreto', () => {
      component.onAdd();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/add']);
    });
  });

  describe('_loadCatalog', () => {
    it('establece marcas y modelos cuando la llamada tiene éxito', async () => {
      mockBrandUseCases.getAll.mockResolvedValue([{ id: 'b1', name: 'Nintendo' }]);
      mockModelUseCases.getAllByType.mockResolvedValue([{ id: 'm1', name: 'SNES' }]);

      await (component as any)._loadCatalog('console');

      expect(mockBrandUseCases.getAll).toHaveBeenCalled();
      expect(mockModelUseCases.getAllByType).toHaveBeenCalledWith('console');
      expect((component as any)._brands()).toHaveLength(1);
      expect((component as any)._brands()[0].name).toBe('Nintendo');
      expect((component as any)._hardwareModels()).toHaveLength(1);
      expect((component as any)._hardwareModels()[0].name).toBe('SNES');
    });

    it('mantiene marcas y modelos vacíos y no propaga la excepción cuando falla', async () => {
      mockBrandUseCases.getAll.mockRejectedValue(new Error('network error'));
      mockModelUseCases.getAllByType.mockRejectedValue(new Error('network error'));

      await expect((component as any)._loadCatalog('console')).resolves.toBeUndefined();

      expect((component as any)._brands()).toHaveLength(0);
      expect((component as any)._hardwareModels()).toHaveLength(0);
    });
  });

  describe('_loadStores', () => {
    it('establece las tiendas cuando la llamada tiene éxito', async () => {
      mockStoreUseCases.getAllStores.mockResolvedValue([{ id: 'store-1', label: 'GameStop' }]);

      await (component as any)._loadStores();

      expect(mockStoreUseCases.getAllStores).toHaveBeenCalled();
      expect((component as any)._stores()).toHaveLength(1);
      expect((component as any)._stores()[0].label).toBe('GameStop');
    });

    it('mantiene las tiendas vacías y no propaga la excepción cuando falla', async () => {
      mockStoreUseCases.getAllStores.mockRejectedValue(new Error('network error'));

      await expect((component as any)._loadStores()).resolves.toBeUndefined();

      expect((component as any)._stores()).toHaveLength(0);
    });
  });
});
