import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { StoresManagementComponent } from './stores-management.component';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { AUDIT_LOG_USE_CASES } from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { TranslocoService } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { StoreModel } from '@/models/store/store.model';

function makeStore(overrides: Partial<StoreModel> = {}): StoreModel {
  return { id: 'store-1', label: 'Amazon', formatHint: null, ...overrides };
}

describe('StoresManagementComponent', () => {
  let component: StoresManagementComponent;
  let fixture: ComponentFixture<StoresManagementComponent>;
  let mockTransloco: { translate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransloco = { translate: vi.fn((k: string) => k) };

    TestBed.configureTestingModule({
      imports: [StoresManagementComponent],
      providers: [
        {
          provide: STORE_USE_CASES,
          useValue: {
            getAllStores: vi.fn().mockResolvedValue([]),
            addStore: vi.fn(),
            updateStore: vi.fn(),
            deleteStore: vi.fn()
          }
        },
        { provide: AUDIT_LOG_USE_CASES, useValue: { log: vi.fn() } },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: MatDialog, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(StoresManagementComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(StoresManagementComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('stores es []', () => expect(component.stores()).toEqual([]));
    it('selectedStore es undefined', () => expect(component.selectedStore()).toBeUndefined());
    it('panelOpen es false', () => expect(component.panelOpen()).toBe(false));
  });

  describe('onAddStore', () => {
    it('abre el panel', () => {
      component.onAddStore();
      expect(component.panelOpen()).toBe(true);
    });

    it('establece selectedStore a null (modo creación)', () => {
      component.onAddStore();
      expect(component.selectedStore()).toBeNull();
    });
  });

  describe('onSelectStore', () => {
    it('abre el panel con la tienda seleccionada', () => {
      const store = makeStore();
      component.onSelectStore(store);
      expect(component.panelOpen()).toBe(true);
      expect(component.selectedStore()).toBe(store);
    });
  });

  describe('onClosePanel', () => {
    it('cierra el panel', () => {
      component.panelOpen.set(true);
      component.onClosePanel();
      expect(component.panelOpen()).toBe(false);
    });

    it('resetea selectedStore a undefined', () => {
      component.selectedStore.set(makeStore());
      component.onClosePanel();
      expect(component.selectedStore()).toBeUndefined();
    });
  });

  describe('getFormatHintLabel', () => {
    it('delega en TranslocoService para null', () => {
      component.getFormatHintLabel(null);
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.stores.formatHintNone');
    });

    it('delega en TranslocoService para "digital"', () => {
      component.getFormatHintLabel('digital');
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.stores.formatHintDigital');
    });

    it('delega en TranslocoService para "physical"', () => {
      component.getFormatHintLabel('physical');
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.stores.formatHintPhysical');
    });
  });
});
