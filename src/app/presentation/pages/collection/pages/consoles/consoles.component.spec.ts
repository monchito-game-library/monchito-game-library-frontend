import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ConsolesComponent } from './consoles.component';
import { CONSOLE_USE_CASES } from '@/domain/use-cases/console/console.use-cases.contract';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { ConsoleModel } from '@/models/console/console.model';
import { mockRouter } from '@/testing/router.mock';
import { mockSnackBar } from '@/testing/snack-bar.mock';
import { mockUserContext } from '@/testing/user-context.mock';

function makeConsole(overrides: Partial<ConsoleModel> = {}): ConsoleModel {
  return {
    id: 'console-1',
    userId: 'user-1',
    brandId: 'brand-1',
    modelId: 'model-1',
    editionId: null,
    region: null,
    condition: 'used',
    price: 300,
    store: null,
    purchaseDate: '2023-01-01',
    notes: null,
    createdAt: '2023-01-01T00:00:00Z',
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

describe('ConsolesComponent', () => {
  let component: ConsolesComponent;
  let fixture: ComponentFixture<ConsolesComponent>;

  const mockConsoleUseCases = {
    getAllForUser: vi.fn()
  };

  const mockStoreUseCases = {
    getAllStores: vi.fn()
  };

  const mockBrandUseCases = {
    getAll: vi.fn()
  };

  const mockModelUseCases = {
    getAllByType: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserContext.requireUserId.mockReturnValue('user-1');
    mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
    mockStoreUseCases.getAllStores.mockResolvedValue([]);
    mockBrandUseCases.getAll.mockResolvedValue([]);
    mockModelUseCases.getAllByType.mockResolvedValue([]);

    TestBed.configureTestingModule({
      imports: [
        ConsolesComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: CONSOLE_USE_CASES, useValue: mockConsoleUseCases },
        { provide: STORE_USE_CASES, useValue: mockStoreUseCases },
        { provide: HARDWARE_BRAND_USE_CASES, useValue: mockBrandUseCases },
        { provide: HARDWARE_MODEL_USE_CASES, useValue: mockModelUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ConsolesComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('llama a getAllForUser con el userId correcto y setea los items', async () => {
      mockConsoleUseCases.getAllForUser.mockResolvedValue([makeConsole()]);

      await component.ngOnInit();

      expect(mockConsoleUseCases.getAllForUser).toHaveBeenCalledWith('user-1');
      expect(component.items()).toHaveLength(1);
    });

    it('llama a _loadCatalog con tipo console', async () => {
      await component.ngOnInit();

      expect(mockModelUseCases.getAllByType).toHaveBeenCalledWith('console');
    });

    it('muestra snackbar y mantiene loading en false si la carga de consolas falla', async () => {
      mockConsoleUseCases.getAllForUser.mockRejectedValue(new Error('fail'));

      await component.ngOnInit();

      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });
  });
});
