import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';

import {
  HardwareEditionsManagementComponent,
  HardwareEditionEditPanelComponent
} from './hardware-editions-management.component';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { HARDWARE_EDITION_USE_CASES } from '@/domain/use-cases/hardware-edition/hardware-edition.use-cases.contract';
import { HARDWARE_CONSOLE_SPECS_USE_CASES } from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases.contract';
import { TranslocoService } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';

function makeEdition(overrides: Partial<HardwareEditionModel> = {}): HardwareEditionModel {
  return { id: 'edition-uuid-1', modelId: 'model-uuid-1', name: 'Final Fantasy XVI Limited', ...overrides };
}

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

describe('HardwareEditionsManagementComponent', () => {
  let component: HardwareEditionsManagementComponent;
  let fixture: ComponentFixture<HardwareEditionsManagementComponent>;
  let mockTransloco: { translate: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransloco = { translate: vi.fn((k: string) => k) };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HardwareEditionsManagementComponent],
      providers: [
        {
          provide: HARDWARE_MODEL_USE_CASES,
          useValue: {
            getById: vi.fn().mockResolvedValue(null),
            update: vi.fn(),
            delete: vi.fn()
          }
        },
        {
          provide: HARDWARE_EDITION_USE_CASES,
          useValue: {
            getAllByModel: vi.fn().mockResolvedValue([]),
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
            snapshot: { paramMap: { get: vi.fn().mockReturnValue('model-uuid-1') } }
          }
        },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(HardwareEditionsManagementComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(HardwareEditionsManagementComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('editions es []', () => expect(component.editions()).toEqual([]));
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('panelOpen es false', () => expect(component.panelOpen()).toBe(false));
    it('selectedEdition es undefined', () => expect(component.selectedEdition()).toBeUndefined());
    it('modelPanelOpen es false', () => expect(component.modelPanelOpen()).toBe(false));
  });

  describe('onAddEdition', () => {
    it('cierra el model panel', () => {
      component.modelPanelOpen.set(true);
      component.onAddEdition();
      expect(component.modelPanelOpen()).toBe(false);
    });

    it('establece selectedEdition a null (modo creación)', () => {
      component.onAddEdition();
      expect(component.selectedEdition()).toBeNull();
    });

    it('abre el panel de edición', () => {
      component.onAddEdition();
      expect(component.panelOpen()).toBe(true);
    });
  });

  describe('onSelectEdition', () => {
    it('cierra el model panel', () => {
      component.modelPanelOpen.set(true);
      const edition = makeEdition();
      component.onSelectEdition(edition);
      expect(component.modelPanelOpen()).toBe(false);
    });

    it('establece selectedEdition y abre el panel', () => {
      const edition = makeEdition();
      component.onSelectEdition(edition);
      expect(component.selectedEdition()).toBe(edition);
      expect(component.panelOpen()).toBe(true);
    });
  });

  describe('onClosePanel', () => {
    it('cierra el panel', () => {
      component.panelOpen.set(true);
      component.onClosePanel();
      expect(component.panelOpen()).toBe(false);
    });

    it('resetea selectedEdition a undefined', () => {
      component.selectedEdition.set(makeEdition());
      component.onClosePanel();
      expect(component.selectedEdition()).toBeUndefined();
    });
  });

  describe('onModelPanelClose', () => {
    it('cierra el model panel', () => {
      component.modelPanelOpen.set(true);
      component.onModelPanelClose();
      expect(component.modelPanelOpen()).toBe(false);
    });
  });

  describe('onBack', () => {
    it('navega a /management/hardware si no hay model', () => {
      component.model.set(undefined);
      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/management/hardware']);
    });

    it('navega a /management/hardware/:brandId/models si model tiene brandId', () => {
      component.model.set(makeModel({ brandId: 'brand-uuid-1' }));
      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/management/hardware', 'brand-uuid-1', 'models']);
    });
  });

  describe('_loadEditions (vía ngOnInit)', () => {
    it('rellena editions y pone loading a false', async () => {
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      const mockEditions = [makeEdition()];
      editionUseCases.getAllByModel.mockResolvedValue(mockEditions);

      await component.ngOnInit();

      expect(component.editions()).toEqual(mockEditions);
      expect(component.loading()).toBe(false);
    });

    it('usa cadena vacía como modelId cuando paramMap.get devuelve null', async () => {
      const route = TestBed.inject(ActivatedRoute as any) as any;
      route.snapshot.paramMap.get.mockReturnValueOnce(null);

      await component.ngOnInit();

      expect((component as any)._modelId).toBe('');
    });
  });

  describe('onSaved', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('llama a update cuando hay una edition seleccionada', async () => {
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      editionUseCases.update.mockResolvedValue(undefined);
      editionUseCases.getAllByModel.mockResolvedValue([]);

      component.selectedEdition.set(makeEdition());
      component.panelOpen.set(true);
      await component.onSaved({ name: 'Limited Edition Updated' });

      expect(editionUseCases.update).toHaveBeenCalledWith('edition-uuid-1', { name: 'Limited Edition Updated' });
      expect(component.panelOpen()).toBe(false);
    });

    it('llama a create cuando no hay edition seleccionada (null)', async () => {
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      editionUseCases.create.mockResolvedValue(undefined);
      editionUseCases.getAllByModel.mockResolvedValue([]);

      component.selectedEdition.set(null);
      await component.onSaved({ name: 'Nueva Edición' });

      expect(editionUseCases.create).toHaveBeenCalledWith({ modelId: 'model-uuid-1', name: 'Nueva Edición' });
      expect(component.panelOpen()).toBe(false);
    });
  });

  describe('onDeleteEdition', () => {
    it('no hace nada si no hay edition seleccionada', () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      component.selectedEdition.set(undefined);
      component.onDeleteEdition();
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('no elimina la edition si el dialog se cancela', () => {
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.selectedEdition.set(makeEdition());
      component.onDeleteEdition();

      expect(editionUseCases.delete).not.toHaveBeenCalled();
    });

    it('elimina la edition y cierra el panel si el dialog se confirma', async () => {
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      editionUseCases.delete.mockResolvedValue(undefined);
      editionUseCases.getAllByModel.mockResolvedValue([]);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.panelOpen.set(true);
      component.selectedEdition.set(makeEdition());
      component.onDeleteEdition();
      await new Promise((r) => setTimeout(r, 0));

      expect(editionUseCases.delete).toHaveBeenCalledWith('edition-uuid-1');
      expect(component.panelOpen()).toBe(false);
    });
  });

  describe('onEditModel', () => {
    it('cierra el panel de edición y abre el model panel', async () => {
      component.panelOpen.set(true);
      component.model.set(makeModel({ type: 'controller' }));

      await component.onEditModel();

      expect(component.panelOpen()).toBe(false);
      expect(component.modelPanelOpen()).toBe(true);
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
      component.model.set(makeModel({ type: 'console' }));

      await component.onEditModel();

      expect(specsUseCases.getByModelId).toHaveBeenCalledWith('model-uuid-1');
      expect(component.selectedModelSpecs()).toEqual(mockSpecs);
    });

    it('no carga specs si el modelo es de tipo controller', async () => {
      const specsUseCases = TestBed.inject(HARDWARE_CONSOLE_SPECS_USE_CASES as any) as any;
      component.model.set(makeModel({ type: 'controller' }));

      await component.onEditModel();

      expect(specsUseCases.getByModelId).not.toHaveBeenCalled();
    });

    it('establece selectedModelSpecs a null cuando getByModelId devuelve null', async () => {
      // El mock por defecto ya devuelve null — no es necesario sobreescribir
      component.model.set(makeModel({ type: 'console' }));

      await component.onEditModel();

      expect(component.selectedModelSpecs()).toBeNull();
    });
  });

  describe('onModelSaved', () => {
    it('no hace nada si no hay modelo cargado', async () => {
      component.model.set(undefined);
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;

      await component.onModelSaved({ name: 'Test', type: 'console', generation: 9, specs: null });

      expect(modelUseCases.update).not.toHaveBeenCalled();
    });

    it('llama a update y cierra el model panel', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      modelUseCases.update.mockResolvedValue(undefined);
      modelUseCases.getById.mockResolvedValue(makeModel());
      component.model.set(makeModel({ id: 'model-uuid-1' }));
      component.modelPanelOpen.set(true);

      await component.onModelSaved({ name: 'PS5 Slim', type: 'console', generation: 9, specs: null });

      expect(modelUseCases.update).toHaveBeenCalledWith('model-uuid-1', { name: 'PS5 Slim' });
      expect(component.modelPanelOpen()).toBe(false);
    });

    it('llama a upsert de specs cuando result.specs no es null', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      const specsUseCases = TestBed.inject(HARDWARE_CONSOLE_SPECS_USE_CASES as any) as any;
      modelUseCases.update.mockResolvedValue(undefined);
      modelUseCases.getById.mockResolvedValue(makeModel());
      specsUseCases.upsert.mockResolvedValue(undefined);
      component.model.set(makeModel({ id: 'model-uuid-1' }));

      await component.onModelSaved({
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

  describe('onModelDeleted', () => {
    it('no hace nada si no hay modelo cargado', () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      component.model.set(undefined);
      component.onModelDeleted();
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('no elimina el modelo si el dialog se cancela', () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });
      component.model.set(makeModel());

      component.onModelDeleted();

      expect(modelUseCases.delete).not.toHaveBeenCalled();
    });

    it('elimina el modelo y navega atrás si el dialog se confirma', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      modelUseCases.delete.mockResolvedValue(undefined);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      component.model.set(makeModel({ id: 'model-uuid-1', brandId: 'brand-uuid-1' }));

      component.onModelDeleted();
      await new Promise((r) => setTimeout(r, 0));

      expect(modelUseCases.delete).toHaveBeenCalledWith('model-uuid-1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/management/hardware', 'brand-uuid-1', 'models']);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareEditionEditPanelComponent — template real', () => {
  let component: HardwareEditionEditPanelComponent;
  let fixture: ComponentFixture<HardwareEditionEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        HardwareEditionEditPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HardwareEditionEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('rellena el form cuando se pasa una edition por input', () => {
    fixture.componentRef.setInput('edition', {
      id: 'edition-uuid-1',
      modelId: 'model-uuid-1',
      name: 'God of War Edition'
    });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('God of War Edition');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareEditionEditPanelComponent', () => {
  let component: HardwareEditionEditPanelComponent;
  let fixture: ComponentFixture<HardwareEditionEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ imports: [HardwareEditionEditPanelComponent] });
    TestBed.overrideComponent(HardwareEditionEditPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(HardwareEditionEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('form inicial: name vacío', () => {
    expect(component.form.getRawValue()).toEqual({ name: '' });
  });

  describe('cuando se pasa una edition por input', () => {
    it('rellena el form con el nombre de la edition', () => {
      fixture.componentRef.setInput('edition', {
        id: 'edition-uuid-1',
        modelId: 'model-uuid-1',
        name: 'Astro Bot Edition'
      });
      fixture.detectChanges();
      expect(component.form.getRawValue()).toEqual({ name: 'Astro Bot Edition' });
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
      component.form.patchValue({ name: 'Spider-Man Edition' });
      component.onSave();
      expect(spy).toHaveBeenCalledWith({ name: 'Spider-Man Edition' });
    });
  });
});
