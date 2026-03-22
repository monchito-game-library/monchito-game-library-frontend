import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ProtectorsManagementComponent } from './protectors-management.component';
import { PROTECTOR_USE_CASES } from '@/domain/use-cases/protector/protector.use-cases.contract';
import { AUDIT_LOG_USE_CASES } from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { TranslocoService } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
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
            toggleProtectorActive: vi.fn()
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
});
