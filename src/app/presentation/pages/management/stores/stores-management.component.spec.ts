import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { StoresManagementComponent, StoreEditPanelComponent } from './stores-management.component';
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

  describe('_loadStores (vía ngOnInit)', () => {
    it('rellena stores y pone loading a false', async () => {
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;
      const mockStores = [makeStore()];
      storeUseCases.getAllStores.mockResolvedValue(mockStores);

      await component.ngOnInit();

      expect(component.stores()).toEqual(mockStores);
      expect(component.loading()).toBe(false);
    });
  });

  describe('onDeleteStore', () => {
    it('no elimina el store si el dialog se cancela', () => {
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.selectedStore.set(makeStore());
      component.onDeleteStore();

      expect(storeUseCases.deleteStore).not.toHaveBeenCalled();
    });

    it('elimina el store y recarga la lista si el dialog se confirma', async () => {
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;
      storeUseCases.deleteStore.mockResolvedValue(undefined);
      storeUseCases.getAllStores.mockResolvedValue([]);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.selectedStore.set(makeStore());
      component.onDeleteStore();
      await new Promise((r) => setTimeout(r, 0));

      expect(storeUseCases.deleteStore).toHaveBeenCalledWith('store-1');
      expect(component.panelOpen()).toBe(false);
    });

    it('no hace nada si no hay store seleccionado', () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      component.selectedStore.set(undefined);
      component.onDeleteStore();
      expect(dialog.open).not.toHaveBeenCalled();
    });
  });

  describe('onSaved', () => {
    it('llama a updateStore cuando hay un store seleccionado', async () => {
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;
      storeUseCases.updateStore.mockResolvedValue(undefined);
      storeUseCases.getAllStores.mockResolvedValue([]);

      component.selectedStore.set(makeStore());
      component.panelOpen.set(true);
      await component.onSaved({ label: 'Amazon Updated', formatHint: 'digital' });

      expect(storeUseCases.updateStore).toHaveBeenCalledWith('store-1', {
        label: 'Amazon Updated',
        formatHint: 'digital'
      });
      expect(component.panelOpen()).toBe(false);
    });

    it('llama a addStore cuando no hay store seleccionado (null)', async () => {
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;
      storeUseCases.addStore.mockResolvedValue(undefined);
      storeUseCases.getAllStores.mockResolvedValue([]);

      component.selectedStore.set(null);
      await component.onSaved({ label: 'Nueva Tienda', formatHint: null });

      expect(storeUseCases.addStore).toHaveBeenCalledWith({ label: 'Nueva Tienda', formatHint: null }, 'user-1');
      expect(component.panelOpen()).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('StoreEditPanelComponent — template real', () => {
  let component: StoreEditPanelComponent;
  let fixture: ComponentFixture<StoreEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        StoreEditPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(StoreEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza modo edición cuando se pasa un store por input', () => {
    fixture.componentRef.setInput('store', { id: 's1', label: 'Steam', formatHint: 'digital' });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('Steam');
  });
});

describe('StoreEditPanelComponent', () => {
  let component: StoreEditPanelComponent;
  let fixture: ComponentFixture<StoreEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ imports: [StoreEditPanelComponent] });
    TestBed.overrideComponent(StoreEditPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(StoreEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('form inicial: name vacío y formatHint null', () => {
    expect(component.form.getRawValue()).toEqual({ name: '', formatHint: null });
  });

  describe('cuando se pasa un store por input', () => {
    it('rellena el form con name y formatHint del store', () => {
      fixture.componentRef.setInput('store', { id: 's1', label: 'Steam', formatHint: 'digital' });
      fixture.detectChanges();
      expect(component.form.getRawValue()).toEqual({ name: 'Steam', formatHint: 'digital' });
    });
  });

  describe('onSave', () => {
    it('no emite si el form es inválido (name vacío)', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: '' });
      component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });

    it('emite el resultado correcto si el form es válido', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'Amazon', formatHint: 'physical' });
      component.onSave();
      expect(spy).toHaveBeenCalledWith({ label: 'Amazon', formatHint: 'physical' });
    });
  });
});
