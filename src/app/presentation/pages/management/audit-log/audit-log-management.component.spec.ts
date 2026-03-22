import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AuditLogManagementComponent } from './audit-log-management.component';
import { AUDIT_LOG_USE_CASES } from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('AuditLogManagementComponent', () => {
  let component: AuditLogManagementComponent;
  let fixture: ComponentFixture<AuditLogManagementComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [AuditLogManagementComponent],
      providers: [
        { provide: AUDIT_LOG_USE_CASES, useValue: { getRecentLogs: vi.fn().mockResolvedValue([]) } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(AuditLogManagementComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(AuditLogManagementComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('entries es []', () => expect(component.entries()).toEqual([]));
  });

  describe('getActionIcon', () => {
    it.each([
      ['store.create', 'add_business'],
      ['store.update', 'edit'],
      ['store.delete', 'delete'],
      ['user.role_change', 'manage_accounts'],
      ['protector.create', 'add_box'],
      ['protector.update', 'edit'],
      ['protector.toggle_active', 'toggle_on']
    ])('"%s" → "%s"', (action, icon) => {
      expect(component.getActionIcon(action)).toBe(icon);
    });

    it('devuelve "history" para acción desconocida', () => {
      expect(component.getActionIcon('unknown.action')).toBe('history');
    });
  });

  describe('getActionLabel', () => {
    it('delega en TranslocoService con la clave correcta', () => {
      const transloco = TestBed.inject(TranslocoService as any) as any;
      component.getActionLabel('store.create');
      expect(transloco.translate).toHaveBeenCalledWith('management.auditLog.actions.store_create');
    });
  });
});
