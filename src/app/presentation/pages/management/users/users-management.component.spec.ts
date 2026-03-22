import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { UsersManagementComponent } from './users-management.component';
import { USER_ADMIN_USE_CASES } from '@/domain/use-cases/user-admin/user-admin.use-cases.contract';
import { AUDIT_LOG_USE_CASES } from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('UsersManagementComponent', () => {
  let component: UsersManagementComponent;
  let fixture: ComponentFixture<UsersManagementComponent>;
  let mockTransloco: { translate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransloco = { translate: vi.fn((k: string) => k) };

    TestBed.configureTestingModule({
      imports: [UsersManagementComponent],
      providers: [
        {
          provide: USER_ADMIN_USE_CASES,
          useValue: { getAllUsers: vi.fn().mockResolvedValue([]), setUserRole: vi.fn().mockResolvedValue(undefined) }
        },
        { provide: AUDIT_LOG_USE_CASES, useValue: { log: vi.fn().mockResolvedValue(undefined) } },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: MatSnackBar, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(UsersManagementComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(UsersManagementComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('updatingUserId es null', () => expect(component.updatingUserId()).toBeNull());
    it('users es []', () => expect(component.users()).toEqual([]));
    it('roles expone "user" y "admin"', () => expect(component.roles).toEqual(['user', 'admin']));
  });

  describe('isCurrentUser', () => {
    it('es true si el userId coincide con el del contexto', () => {
      expect(component.isCurrentUser('user-1')).toBe(true);
    });

    it('es false si el userId no coincide', () => {
      expect(component.isCurrentUser('user-2')).toBe(false);
    });
  });

  describe('getRoleLabel', () => {
    it('delega en TranslocoService con la clave correcta para "admin"', () => {
      component.getRoleLabel('admin');
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.users.roleAdmin');
    });

    it('delega en TranslocoService con la clave correcta para "user"', () => {
      component.getRoleLabel('user');
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.users.roleUser');
    });
  });

  describe('onRoleChange', () => {
    it('no llama a setUserRole si el rol no cambia', async () => {
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;
      const user = { userId: 'user-2', role: 'user', email: 'test@example.com' } as any;
      await component.onRoleChange(user, 'user');
      expect(useCases.setUserRole).not.toHaveBeenCalled();
    });
  });
});
