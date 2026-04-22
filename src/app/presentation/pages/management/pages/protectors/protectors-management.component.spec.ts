import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { ProtectorsManagementComponent } from './protectors-management.component';
import { PROTECTOR_USE_CASES } from '@/domain/use-cases/protector/protector.use-cases.contract';
import { AUDIT_LOG_USE_CASES } from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { TranslocoService } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProtectorModel } from '@/models/protector/protector.model';

function makeProtector(overrides: Partial<ProtectorModel> = {}): ProtectorModel {
  return { id: 'prot-1', name: 'BigBen PS5', category: 'box', notes: null, isActive: true, packs: [], ...overrides };
}

describe('ProtectorsManagementComponent', () => {
  let component: ProtectorsManagementComponent;
  let fixture: ComponentFixture<ProtectorsManagementComponent>;
  let mockTransloco: { translate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransloco = { translate: vi.fn((k: string) => k) };

    TestBed.configureTestingModule({
      imports: [ProtectorsManagementComponent],
      providers: [
        {
          provide: PROTECTOR_USE_CASES,
          useValue: {
            getAllProtectors: vi.fn().mockResolvedValue([]),
            addProtector: vi.fn(),
            updateProtector: vi.fn(),
            toggleProtectorActive: vi.fn(),
            deleteProtector: vi.fn()
          }
        },
        { provide: AUDIT_LOG_USE_CASES, useValue: { log: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: MatDialog, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(ProtectorsManagementComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(ProtectorsManagementComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('protectors es []', () => expect(component.protectors()).toEqual([]));
    it('selectedProtector es undefined', () => expect(component.selectedProtector()).toBeUndefined());
    it('panelOpen es false', () => expect(component.panelOpen()).toBe(false));
  });

  describe('onAddProtector', () => {
    it('abre el panel', () => {
      component.onAddProtector();
      expect(component.panelOpen()).toBe(true);
    });

    it('establece selectedProtector a null (modo creación)', () => {
      component.onAddProtector();
      expect(component.selectedProtector()).toBeNull();
    });
  });

  describe('onSelectProtector', () => {
    it('abre el panel con el protector seleccionado', () => {
      const p = makeProtector();
      component.onSelectProtector(p);
      expect(component.panelOpen()).toBe(true);
      expect(component.selectedProtector()).toBe(p);
    });
  });

  describe('onClosePanel', () => {
    it('cierra el panel', () => {
      component.panelOpen.set(true);
      component.onClosePanel();
      expect(component.panelOpen()).toBe(false);
    });

    it('resetea selectedProtector a undefined', () => {
      component.selectedProtector.set(makeProtector());
      component.onClosePanel();
      expect(component.selectedProtector()).toBeUndefined();
    });
  });

  describe('getCategoryLabel', () => {
    it('delega en TranslocoService con la clave correcta para "box"', () => {
      component.getCategoryLabel('box');
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.products.categoryBox');
    });

    it('delega en TranslocoService con la clave correcta para "console"', () => {
      component.getCategoryLabel('console');
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.products.categoryConsole');
    });
  });

  describe('getMinUnitPrice', () => {
    it('devuelve 0 cuando no hay packs', () => {
      expect(component.getMinUnitPrice(makeProtector({ packs: [] }))).toBe(0);
    });

    it('devuelve el precio unitario mínimo', () => {
      const p = makeProtector({
        packs: [
          { quantity: 1, price: 10, url: null },
          { quantity: 5, price: 20, url: null }
        ]
      });
      // pack1: 10/1 = 10, pack2: 20/5 = 4 → mínimo = 4
      expect(component.getMinUnitPrice(p)).toBe(4);
    });
  });

  describe('onToggleActive', () => {
    it('no llama a toggleProtectorActive si el dialog se cancela', () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.onToggleActive(makeProtector());

      expect(protectorUseCases.toggleProtectorActive).not.toHaveBeenCalled();
    });

    it('llama a toggleProtectorActive y recarga si el dialog se confirma', async () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      protectorUseCases.toggleProtectorActive.mockResolvedValue(undefined);
      protectorUseCases.getAllProtectors.mockResolvedValue([]);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.onToggleActive(makeProtector({ isActive: true }));
      await new Promise((r) => setTimeout(r, 0));

      expect(protectorUseCases.toggleProtectorActive).toHaveBeenCalledWith('prot-1', false);
    });

    it('activa el protector cuando isActive es false', async () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      protectorUseCases.toggleProtectorActive.mockResolvedValue(undefined);
      protectorUseCases.getAllProtectors.mockResolvedValue([]);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.onToggleActive(makeProtector({ isActive: false }));
      await new Promise((r) => setTimeout(r, 0));

      expect(protectorUseCases.toggleProtectorActive).toHaveBeenCalledWith('prot-1', true);
    });
  });

  describe('onDeleteProtector', () => {
    it('no llama a deleteProtector si el dialog se cancela', () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.onDeleteProtector(makeProtector());

      expect(protectorUseCases.deleteProtector).not.toHaveBeenCalled();
    });

    it('llama a deleteProtector, cierra el panel y recarga si el dialog se confirma', async () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      protectorUseCases.deleteProtector.mockResolvedValue(undefined);
      protectorUseCases.getAllProtectors.mockResolvedValue([]);
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.panelOpen.set(true);
      component.selectedProtector.set(makeProtector());
      component.onDeleteProtector(makeProtector());
      await new Promise((r) => setTimeout(r, 0));

      expect(protectorUseCases.deleteProtector).toHaveBeenCalledWith('prot-1');
      expect(component.panelOpen()).toBe(false);
    });

    it('muestra snackbar de error si deleteProtector lanza', async () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      protectorUseCases.deleteProtector.mockRejectedValue(new Error('delete error'));
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const snackBar = TestBed.inject(MatSnackBar);
      vi.spyOn(snackBar, 'open');

      component.onDeleteProtector(makeProtector());
      await new Promise((r) => setTimeout(r, 0));

      expect(snackBar.open).toHaveBeenCalledWith(expect.any(String), '', expect.objectContaining({ duration: 4000 }));
    });
  });

  describe('_loadProtectors (vía ngOnInit)', () => {
    it('rellena protectors y pone loading a false', async () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      const mockProtectors = [makeProtector()];
      protectorUseCases.getAllProtectors.mockResolvedValue(mockProtectors);

      await component.ngOnInit();

      expect(component.protectors()).toEqual(mockProtectors);
      expect(component.loading()).toBe(false);
    });
  });

  describe('onSaved', () => {
    it('llama a updateProtector cuando hay un protector seleccionado', async () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      protectorUseCases.updateProtector.mockResolvedValue(undefined);
      protectorUseCases.getAllProtectors.mockResolvedValue([]);

      const p = makeProtector();
      component.selectedProtector.set(p);
      component.panelOpen.set(true);
      await component.onSaved({ name: 'BigBen Updated', category: 'console', notes: null, packs: [] });

      expect(protectorUseCases.updateProtector).toHaveBeenCalledWith('prot-1', {
        name: 'BigBen Updated',
        category: 'console',
        notes: null,
        packs: []
      });
      expect(component.panelOpen()).toBe(false);
    });

    it('llama a addProtector cuando no hay protector seleccionado (null)', async () => {
      const protectorUseCases = TestBed.inject(PROTECTOR_USE_CASES as any) as any;
      protectorUseCases.addProtector.mockResolvedValue(undefined);
      protectorUseCases.getAllProtectors.mockResolvedValue([]);

      component.selectedProtector.set(null);
      await component.onSaved({ name: 'Nuevo Protector', category: 'box', notes: null, packs: [] });

      expect(protectorUseCases.addProtector).toHaveBeenCalledWith({
        name: 'Nuevo Protector',
        category: 'box',
        notes: null,
        packs: [],
        isActive: true
      });
      expect(component.panelOpen()).toBe(false);
    });
  });
});
