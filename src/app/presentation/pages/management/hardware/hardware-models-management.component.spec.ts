import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';

import {
  HardwareModelsManagementComponent,
  HardwareModelEditPanelComponent
} from './hardware-models-management.component';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { HARDWARE_CONSOLE_SPECS_USE_CASES } from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases.contract';
import { TranslocoService } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';

function makeModel(overrides: Partial<HardwareModelModel> = {}): HardwareModelModel {
  return {
    id: 'model-uuid-1',
    brandId: 'brand-uuid-1',
    name: 'PlayStation 5',
    type: 'console',
    generation: 9,
    ...overrides
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareModelsManagementComponent', () => {
  let component: HardwareModelsManagementComponent;
  let fixture: ComponentFixture<HardwareModelsManagementComponent>;
  let mockTransloco: { translate: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransloco = { translate: vi.fn((k: string) => k) };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HardwareModelsManagementComponent],
      providers: [
        {
          provide: HARDWARE_BRAND_USE_CASES,
          useValue: {
            getAll: vi.fn().mockResolvedValue([]),
            getById: vi.fn().mockResolvedValue(null)
          }
        },
        {
          provide: HARDWARE_MODEL_USE_CASES,
          useValue: {
            getAllByBrand: vi.fn().mockResolvedValue([]),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
          }
        },
        {
          provide: HARDWARE_CONSOLE_SPECS_USE_CASES,
          useValue: {
            getByModelId: vi.fn().mockResolvedValue(null),
            upsert: vi.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: vi.fn().mockReturnValue('brand-uuid-1') } }
          }
        },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(HardwareModelsManagementComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(HardwareModelsManagementComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('models es []', () => expect(component.models()).toEqual([]));
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('panelOpen es false', () => expect(component.panelOpen()).toBe(false));
    it('selectedModel es undefined', () => expect(component.selectedModel()).toBeUndefined());
  });

  describe('onAddModel', () => {
    it('establece selectedModel a null (modo creación)', () => {
      component.onAddModel();
      expect(component.selectedModel()).toBeNull();
    });

    it('abre el panel', () => {
      component.onAddModel();
      expect(component.panelOpen()).toBe(true);
    });
  });

  describe('onSelectModel', () => {
    it('establece selectedModel y abre el panel', async () => {
      const model = makeModel({ type: 'controller' });
      await component.onSelectModel(model);
      expect(component.selectedModel()).toBe(model);
      expect(component.panelOpen()).toBe(true);
    });

    it('carga specs si el modelo es de tipo console', async () => {
      const specsUseCases = TestBed.inject(HARDWARE_CONSOLE_SPECS_USE_CASES as any) as any;
      const mockSpecs = {
        id: 'specs-1',
        modelId: 'model-uuid-1',
        launchYear: 2020,
        discontinuedYear: null,
        category: 'home',
        media: 'optical_disc',
        videoResolution: null,
        unitsSoldMillion: null
      };
      specsUseCases.getByModelId.mockResolvedValue(mockSpecs);

      const model = makeModel({ type: 'console' });
      await component.onSelectModel(model);

      expect(specsUseCases.getByModelId).toHaveBeenCalledWith('model-uuid-1');
      expect(component.selectedSpecs()).toEqual(mockSpecs);
    });

    it('establece selectedSpecs a null cuando getByModelId devuelve null', async () => {
      // El mock por defecto ya devuelve null — no es necesario sobreescribir
      const model = makeModel({ type: 'console' });
      await component.onSelectModel(model);

      expect(component.selectedSpecs()).toBeNull();
    });
  });

  describe('onClosePanel', () => {
    it('cierra el panel', () => {
      component.panelOpen.set(true);
      component.onClosePanel();
      expect(component.panelOpen()).toBe(false);
    });

    it('resetea selectedModel a undefined', () => {
      component.selectedModel.set(makeModel());
      component.onClosePanel();
      expect(component.selectedModel()).toBeUndefined();
    });
  });

  describe('getTypeLabel', () => {
    it('devuelve una cadena no vacía para type "console"', () => {
      const label = component.getTypeLabel('console');
      expect(label.length).toBeGreaterThan(0);
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.hardware.models.typeConsole');
    });

    it('devuelve una cadena no vacía para type "controller"', () => {
      const label = component.getTypeLabel('controller');
      expect(label.length).toBeGreaterThan(0);
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.hardware.models.typeController');
    });
  });

  describe('getModelChips', () => {
    it('devuelve al menos un chip con la etiqueta del tipo', () => {
      const chips = component.getModelChips(makeModel({ generation: null }));
      expect(chips.length).toBeGreaterThanOrEqual(1);
    });

    it('añade chip "Gen X" cuando el modelo tiene generation', () => {
      const chips = component.getModelChips(makeModel({ generation: 9 }));
      expect(chips).toContain('Gen 9');
    });

    it('no añade chip de generación cuando generation es null', () => {
      const chips = component.getModelChips(makeModel({ generation: null }));
      expect(chips.every((c: string) => !c.startsWith('Gen'))).toBe(true);
    });
  });

  describe('_loadModels (vía ngOnInit)', () => {
    it('rellena models y pone loading a false', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      const mockModels = [makeModel()];
      modelUseCases.getAllByBrand.mockResolvedValue(mockModels);

      await component.ngOnInit();

      expect(component.models()).toEqual(mockModels);
      expect(component.loading()).toBe(false);
    });

    it('usa cadena vacía como brandId cuando paramMap.get devuelve null', async () => {
      const route = TestBed.inject(ActivatedRoute as any) as any;
      route.snapshot.paramMap.get.mockReturnValueOnce(null);

      await component.ngOnInit();

      expect((component as any)._brandId).toBe('');
    });
  });

  describe('onDeleteModel', () => {
    it('no hace nada si no hay modelo seleccionado', () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      component.selectedModel.set(undefined);
      component.onDeleteModel();
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('no elimina el modelo si el dialog se cancela', () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.selectedModel.set(makeModel());
      component.onDeleteModel();

      expect(modelUseCases.delete).not.toHaveBeenCalled();
    });

    it('elimina el modelo y cierra el panel si el dialog se confirma', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      modelUseCases.delete.mockResolvedValue(undefined);
      modelUseCases.getAllByBrand.mockResolvedValue([]);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.panelOpen.set(true);
      component.selectedModel.set(makeModel());
      component.onDeleteModel();
      await new Promise((r) => setTimeout(r, 0));

      expect(modelUseCases.delete).toHaveBeenCalledWith('model-uuid-1');
      expect(component.panelOpen()).toBe(false);
    });
  });

  describe('onBack', () => {
    it('navega a /management/hardware', () => {
      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/management/hardware']);
    });
  });

  describe('onEditBrand', () => {
    it('cierra el panel de modelo y abre el panel de marca', () => {
      component.panelOpen.set(true);
      component.onEditBrand();
      expect(component.panelOpen()).toBe(false);
      expect(component.brandPanelOpen()).toBe(true);
    });

    it('resetea selectedModel a undefined', () => {
      component.selectedModel.set(makeModel());
      component.onEditBrand();
      expect(component.selectedModel()).toBeUndefined();
    });
  });

  describe('onBrandPanelClose', () => {
    it('cierra el panel de marca', () => {
      component.brandPanelOpen.set(true);
      component.onBrandPanelClose();
      expect(component.brandPanelOpen()).toBe(false);
    });
  });

  describe('onBrandSaved', () => {
    it('no hace nada si no hay marca cargada', async () => {
      component.brand.set(undefined);
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      brandUseCases.update = vi.fn();

      await component.onBrandSaved({ name: 'Nueva Marca' });

      expect(brandUseCases.update).not.toHaveBeenCalled();
    });

    it('llama a update y cierra el panel de marca', async () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      brandUseCases.update = vi.fn().mockResolvedValue(undefined);
      brandUseCases.getById = vi.fn().mockResolvedValue({ id: 'brand-uuid-1', name: 'Sony' });
      component.brand.set({ id: 'brand-uuid-1', name: 'Sony' });
      component.brandPanelOpen.set(true);

      await component.onBrandSaved({ name: 'Sony Actualizado' });

      expect(brandUseCases.update).toHaveBeenCalledWith('brand-uuid-1', { name: 'Sony Actualizado' });
      expect(component.brandPanelOpen()).toBe(false);
    });
  });

  describe('onBrandDeleted', () => {
    it('no hace nada si no hay marca cargada', () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      component.brand.set(undefined);
      component.onBrandDeleted();
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('no elimina la marca si el dialog se cancela', () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      brandUseCases.delete = vi.fn();
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });
      component.brand.set({ id: 'brand-uuid-1', name: 'Sony' });

      component.onBrandDeleted();

      expect(brandUseCases.delete).not.toHaveBeenCalled();
    });

    it('elimina la marca y navega al listado si el dialog se confirma', async () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      brandUseCases.delete = vi.fn().mockResolvedValue(undefined);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      component.brand.set({ id: 'brand-uuid-1', name: 'Sony' });

      component.onBrandDeleted();
      await new Promise((r) => setTimeout(r, 0));

      expect(brandUseCases.delete).toHaveBeenCalledWith('brand-uuid-1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/management/hardware']);
    });
  });

  describe('onOpenEditions', () => {
    it('navega a la página de ediciones del modelo', () => {
      component.onOpenEditions(makeModel({ id: 'model-uuid-1' }));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/management/hardware/models', 'model-uuid-1', 'editions']);
    });
  });

  describe('onSaved', () => {
    const modelResult = { name: 'PS5 Slim', type: 'console' as const, generation: 9, specs: null };

    it('llama a update si hay modelo seleccionado y cierra el panel', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      modelUseCases.update.mockResolvedValue(undefined);
      modelUseCases.getAllByBrand.mockResolvedValue([]);
      component.selectedModel.set(makeModel({ id: 'model-uuid-1' }));
      component.panelOpen.set(true);

      await component.onSaved(modelResult);

      expect(modelUseCases.update).toHaveBeenCalledWith('model-uuid-1', { name: 'PS5 Slim' });
      expect(component.panelOpen()).toBe(false);
    });

    it('llama a create si no hay modelo seleccionado (null)', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      modelUseCases.create = vi
        .fn()
        .mockResolvedValue({
          id: 'new-model-id',
          name: 'PS5 Slim',
          type: 'console',
          generation: 9,
          brandId: 'brand-uuid-1'
        });
      modelUseCases.getAllByBrand.mockResolvedValue([]);
      await component.ngOnInit(); // carga _brandId desde la ruta
      component.selectedModel.set(null);

      await component.onSaved(modelResult);

      expect(modelUseCases.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'PS5 Slim', type: 'console' }));
      expect(component.panelOpen()).toBe(false);
    });

    it('llama a upsert de specs cuando result.specs no es null', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      const specsUseCases = TestBed.inject(HARDWARE_CONSOLE_SPECS_USE_CASES as any) as any;
      modelUseCases.update.mockResolvedValue(undefined);
      modelUseCases.getAllByBrand.mockResolvedValue([]);
      specsUseCases.upsert.mockResolvedValue(undefined);
      component.selectedModel.set(makeModel({ id: 'model-uuid-1' }));

      await component.onSaved({
        name: 'PS5',
        type: 'console',
        generation: 9,
        specs: {
          launchYear: 2020,
          discontinuedYear: null,
          category: 'home',
          media: 'optical_disc',
          videoResolution: null,
          unitsSoldMillion: null
        }
      });

      expect(specsUseCases.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ modelId: 'model-uuid-1', launchYear: 2020 })
      );
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareModelEditPanelComponent — template real', () => {
  let component: HardwareModelEditPanelComponent;
  let fixture: ComponentFixture<HardwareModelEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        HardwareModelEditPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HardwareModelEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('rellena el form cuando se pasa un modelo por input', () => {
    fixture.componentRef.setInput('model', {
      id: 'model-uuid-1',
      brandId: 'brand-uuid-1',
      name: 'Xbox Series X',
      type: 'console',
      generation: 9
    });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('Xbox Series X');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareModelEditPanelComponent', () => {
  let component: HardwareModelEditPanelComponent;
  let fixture: ComponentFixture<HardwareModelEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ imports: [HardwareModelEditPanelComponent] });
    TestBed.overrideComponent(HardwareModelEditPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(HardwareModelEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('form inicial: name vacío, type console', () => {
    expect(component.form.getRawValue().name).toBe('');
    expect(component.form.getRawValue().type).toBe('console');
  });

  describe('isConsole (computed signal)', () => {
    it('es true cuando el type es "console"', () => {
      component.form.controls.type.setValue('console');
      expect(component.isConsole()).toBe(true);
    });

    it('es false cuando el type es "controller"', () => {
      component.form.controls.type.setValue('controller');
      expect(component.isConsole()).toBe(false);
    });
  });

  describe('cuando se pasa un modelo por input', () => {
    it('rellena el form con el nombre del modelo', () => {
      fixture.componentRef.setInput('model', {
        id: 'm1',
        brandId: 'b1',
        name: 'Nintendo Switch',
        type: 'console',
        generation: 8
      });
      fixture.detectChanges();
      expect(component.form.getRawValue().name).toBe('Nintendo Switch');
      expect(component.form.getRawValue().generation).toBe(8);
    });
  });

  describe('onSave', () => {
    it('no emite si el form es inválido (name vacío)', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: '', type: 'controller' });
      component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });

    it('no emite si type es console y launchYear es null', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'PS5', type: 'console', launchYear: null });
      component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });

    it('emite el resultado correcto para type controller', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'DualSense', type: 'controller', generation: 5 });
      component.onSave();
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'DualSense', type: 'controller', specs: null }));
    });

    it('emite el resultado correcto para type console con launchYear', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({
        name: 'PS5',
        type: 'console',
        generation: 9,
        launchYear: 2020,
        category: 'home',
        media: 'optical_disc'
      });
      component.onSave();
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'PS5', type: 'console', specs: expect.objectContaining({ launchYear: 2020 }) })
      );
    });
  });
});
