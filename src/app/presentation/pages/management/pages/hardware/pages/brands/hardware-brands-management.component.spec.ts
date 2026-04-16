import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { HardwareBrandsManagementComponent } from './hardware-brands-management.component';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { TranslocoService } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';

function makeBrand(overrides: Partial<HardwareBrandModel> = {}): HardwareBrandModel {
  return { id: 'brand-uuid-1', name: 'Sony', ...overrides };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareBrandsManagementComponent', () => {
  let component: HardwareBrandsManagementComponent;
  let fixture: ComponentFixture<HardwareBrandsManagementComponent>;
  let mockTransloco: { translate: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransloco = { translate: vi.fn((k: string) => k) };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HardwareBrandsManagementComponent],
      providers: [
        {
          provide: HARDWARE_BRAND_USE_CASES,
          useValue: {
            getAll: vi.fn().mockResolvedValue([]),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
          }
        },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(HardwareBrandsManagementComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(HardwareBrandsManagementComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('brands es []', () => expect(component.brands()).toEqual([]));
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('panelOpen es false', () => expect(component.panelOpen()).toBe(false));
    it('selectedBrand es undefined', () => expect(component.selectedBrand()).toBeUndefined());
  });

  describe('onAddBrand', () => {
    it('establece selectedBrand a null (modo creación)', () => {
      component.onAddBrand();
      expect(component.selectedBrand()).toBeNull();
    });

    it('abre el panel', () => {
      component.onAddBrand();
      expect(component.panelOpen()).toBe(true);
    });
  });

  describe('onSelectBrand', () => {
    it('establece selectedBrand y abre el panel', () => {
      const brand = makeBrand();
      component.onSelectBrand(brand);
      expect(component.selectedBrand()).toBe(brand);
      expect(component.panelOpen()).toBe(true);
    });
  });

  describe('onOpenModels', () => {
    it('navega a /management/hardware/:brandId/models', () => {
      const brand = makeBrand({ id: 'brand-uuid-1' });
      component.onOpenModels(brand);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/management/hardware', 'brand-uuid-1', 'models']);
    });
  });

  describe('onClosePanel', () => {
    it('cierra el panel', () => {
      component.panelOpen.set(true);
      component.onClosePanel();
      expect(component.panelOpen()).toBe(false);
    });

    it('resetea selectedBrand a undefined', () => {
      component.selectedBrand.set(makeBrand());
      component.onClosePanel();
      expect(component.selectedBrand()).toBeUndefined();
    });
  });

  describe('_loadBrands (vía ngOnInit)', () => {
    it('rellena brands y pone loading a false', async () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      const mockBrands = [makeBrand()];
      brandUseCases.getAll.mockResolvedValue(mockBrands);

      await component.ngOnInit();

      expect(component.brands()).toEqual(mockBrands);
      expect(component.loading()).toBe(false);
    });
  });

  describe('onSaved', () => {
    it('llama a update cuando hay una brand seleccionada', async () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      brandUseCases.update.mockResolvedValue(undefined);
      brandUseCases.getAll.mockResolvedValue([]);

      const brand = makeBrand();
      component.selectedBrand.set(brand);
      component.panelOpen.set(true);
      await component.onSaved({ name: 'Sony Updated' });

      expect(brandUseCases.update).toHaveBeenCalledWith('brand-uuid-1', { name: 'Sony Updated' });
      expect(component.panelOpen()).toBe(false);
    });

    it('llama a create cuando no hay brand seleccionada (null)', async () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      brandUseCases.create.mockResolvedValue(undefined);
      brandUseCases.getAll.mockResolvedValue([]);

      component.selectedBrand.set(null);
      await component.onSaved({ name: 'Microsoft' });

      expect(brandUseCases.create).toHaveBeenCalledWith({ name: 'Microsoft' });
      expect(component.panelOpen()).toBe(false);
    });
  });

  describe('onDeleteBrand', () => {
    it('no hace nada si no hay brand seleccionada', () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      component.selectedBrand.set(undefined);
      component.onDeleteBrand();
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('no elimina la brand si el dialog se cancela', () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.selectedBrand.set(makeBrand());
      component.onDeleteBrand();

      expect(brandUseCases.delete).not.toHaveBeenCalled();
    });

    it('elimina la brand y cierra el panel si el dialog se confirma', async () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      brandUseCases.delete.mockResolvedValue(undefined);
      brandUseCases.getAll.mockResolvedValue([]);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.panelOpen.set(true);
      component.selectedBrand.set(makeBrand());
      component.onDeleteBrand();
      await new Promise((r) => setTimeout(r, 0));

      expect(brandUseCases.delete).toHaveBeenCalledWith('brand-uuid-1');
      expect(component.panelOpen()).toBe(false);
    });
  });
});
