import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { UsersManagementComponent } from './users-management.component';
import { USER_ADMIN_USE_CASES } from '@/domain/use-cases/user-admin/user-admin.use-cases.contract';
import { AUDIT_LOG_USE_CASES } from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';

const mockUsers = [
  { userId: 'u-owner', email: 'owner@test.com', role: 'owner', avatarUrl: null, createdAt: '2024-01-01T00:00:00Z' },
  { userId: 'u-admin1', email: 'admin1@test.com', role: 'admin', avatarUrl: null, createdAt: '2024-06-15T00:00:00Z' },
  { userId: 'u-admin2', email: 'admin2@test.com', role: 'admin', avatarUrl: null, createdAt: '2024-03-10T00:00:00Z' },
  { userId: 'u-mem1', email: 'mem1@test.com', role: 'member', avatarUrl: null, createdAt: '2025-12-01T00:00:00Z' },
  { userId: 'u-mem2', email: 'mem2@test.com', role: 'member', avatarUrl: null, createdAt: '2026-01-15T00:00:00Z' }
] as never[];

describe('UsersManagementComponent', () => {
  let component: UsersManagementComponent;
  let fixture: ComponentFixture<UsersManagementComponent>;
  let mockTransloco: { translate: ReturnType<typeof vi.fn>; getActiveLang: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let mockUserContext: { userId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransloco = {
      translate: vi.fn((k: string) => k),
      getActiveLang: vi.fn(() => 'es')
    };
    mockDialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(true) } as Partial<MatDialogRef<unknown>>)
    };
    mockUserContext = { userId: vi.fn(() => 'u-owner') };

    TestBed.configureTestingModule({
      imports: [UsersManagementComponent],
      providers: [
        {
          provide: USER_ADMIN_USE_CASES,
          useValue: {
            getAllUsers: vi.fn().mockResolvedValue([]),
            setUserRole: vi.fn().mockResolvedValue(undefined),
            deleteUser: vi.fn().mockResolvedValue(undefined)
          }
        },
        { provide: AUDIT_LOG_USE_CASES, useValue: { log: vi.fn().mockResolvedValue(undefined) } },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: mockDialog }
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
    it('activeFilter por defecto es "all"', () => expect(component.activeFilter()).toBe('all'));
    it('filters expone los 3 chips', () => expect(component.filters).toHaveLength(3));
  });

  describe('computed signals con el listado completo', () => {
    beforeEach(() => component.users.set(mockUsers));

    it('ownerUser devuelve el row con role owner', () => {
      expect(component.ownerUser()?.userId).toBe('u-owner');
    });

    it('admins devuelve los 2 admins ordenados por createdAt asc (más antiguos primero)', () => {
      const adminIds = component.admins().map((u) => u.userId);
      expect(adminIds).toEqual(['u-admin2', 'u-admin1']);
    });

    it('members devuelve los 2 members ordenados por createdAt desc (más recientes primero)', () => {
      const memberIds = component.members().map((u) => u.userId);
      expect(memberIds).toEqual(['u-mem2', 'u-mem1']);
    });

    it('stats excluye al owner', () => {
      const stats = component.stats();
      expect(stats.total).toBe(4);
      expect(stats.admins).toBe(2);
      expect(stats.members).toBe(2);
    });

    it('hasNoVisibleUsers es false con datos', () => {
      expect(component.hasNoVisibleUsers()).toBe(false);
    });
  });

  describe('ownerUser cuando no existe owner en la lista', () => {
    it('devuelve null', () => {
      component.users.set(mockUsers.filter((u: any) => u.role !== 'owner') as never[]);
      expect(component.ownerUser()).toBeNull();
    });
  });

  describe('filtros (visibleAdmins / visibleMembers)', () => {
    beforeEach(() => component.users.set(mockUsers));

    it('filter "all" muestra admins y members', () => {
      component.onFilterChange('all');
      expect(component.visibleAdmins()).toHaveLength(2);
      expect(component.visibleMembers()).toHaveLength(2);
    });

    it('filter "admin" oculta members', () => {
      component.onFilterChange('admin');
      expect(component.visibleAdmins()).toHaveLength(2);
      expect(component.visibleMembers()).toHaveLength(0);
    });

    it('filter "member" oculta admins', () => {
      component.onFilterChange('member');
      expect(component.visibleAdmins()).toHaveLength(0);
      expect(component.visibleMembers()).toHaveLength(2);
    });

    it('hasNoVisibleUsers es true cuando el filtro no produce coincidencias', () => {
      component.users.set([
        { userId: 'u-mem', email: 'm@x.com', role: 'member', avatarUrl: null, createdAt: '2026-01-01T00:00:00Z' }
      ] as never[]);
      component.onFilterChange('admin');
      expect(component.hasNoVisibleUsers()).toBe(true);
    });
  });

  describe('onTogglePromotion', () => {
    it('no hace nada si el usuario es owner', async () => {
      const owner: any = mockUsers[0];
      await component.onTogglePromotion(owner);
      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('abre dialog con copy de promote para members', async () => {
      const member: any = mockUsers[3];
      await component.onTogglePromotion(member);
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.users.promote.title');
    });

    it('abre dialog con copy de demote para admins', async () => {
      const admin: any = mockUsers[1];
      await component.onTogglePromotion(admin);
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.users.demote.title');
    });

    it('cuando el usuario confirma, llama a setUserRole con el rol opuesto', async () => {
      const member: any = mockUsers[3];
      component.users.set(mockUsers);
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;

      await component.onTogglePromotion(member);

      expect(useCases.setUserRole).toHaveBeenCalledWith('u-mem1', 'admin');
    });

    it('si el usuario cancela, no llama a setUserRole', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) } as any);
      const member: any = mockUsers[3];
      component.users.set(mockUsers);
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;

      await component.onTogglePromotion(member);

      expect(useCases.setUserRole).not.toHaveBeenCalled();
    });

    it('actualiza el rol localmente al confirmar con éxito', async () => {
      const member: any = mockUsers[3];
      component.users.set(mockUsers);

      await component.onTogglePromotion(member);

      const updated = component.users().find((u) => u.userId === 'u-mem1');
      expect(updated?.role).toBe('admin');
    });

    it('muestra snackbar de error si setUserRole falla', async () => {
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;
      useCases.setUserRole.mockRejectedValue(new Error('fail'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const member: any = mockUsers[3];
      component.users.set(mockUsers);

      await component.onTogglePromotion(member);

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('resetea updatingUserId a null tras la operación', async () => {
      const member: any = mockUsers[3];
      component.users.set(mockUsers);

      await component.onTogglePromotion(member);

      expect(component.updatingUserId()).toBeNull();
    });
  });

  describe('isSelf', () => {
    it('devuelve true cuando el userId coincide con el del UserContext', () => {
      mockUserContext.userId.mockReturnValue('u-admin1');
      const admin: any = mockUsers[1];
      expect(component.isSelf(admin)).toBe(true);
    });

    it('devuelve false cuando el userId no coincide', () => {
      mockUserContext.userId.mockReturnValue('u-owner');
      const admin: any = mockUsers[1];
      expect(component.isSelf(admin)).toBe(false);
    });
  });

  describe('onDeleteUser', () => {
    it('no abre el dialog cuando el usuario es owner', async () => {
      const owner: any = mockUsers[0];
      await component.onDeleteUser(owner);
      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('no abre el dialog cuando el usuario es el propio caller', async () => {
      mockUserContext.userId.mockReturnValue('u-admin1');
      const self: any = mockUsers[1];
      await component.onDeleteUser(self);
      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('abre el dialog con el email del usuario destino', async () => {
      const member: any = mockUsers[3];
      await component.onDeleteUser(member);
      expect(mockDialog.open).toHaveBeenCalled();
      const config = mockDialog.open.mock.calls[0][1];
      expect(config.data.email).toBe('mem1@test.com');
    });

    it('si el usuario cancela el dialog, no llama a deleteUser', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) } as any);
      const member: any = mockUsers[3];
      component.users.set(mockUsers);
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;

      await component.onDeleteUser(member);

      expect(useCases.deleteUser).not.toHaveBeenCalled();
    });

    it('cuando el usuario confirma, llama a deleteUser con el userId', async () => {
      const member: any = mockUsers[3];
      component.users.set(mockUsers);
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;

      await component.onDeleteUser(member);

      expect(useCases.deleteUser).toHaveBeenCalledWith('u-mem1');
    });

    it('elimina el usuario de la lista local al confirmar con éxito', async () => {
      const member: any = mockUsers[3];
      component.users.set(mockUsers);

      await component.onDeleteUser(member);

      expect(component.users().some((u) => u.userId === 'u-mem1')).toBe(false);
      expect(component.users()).toHaveLength(mockUsers.length - 1);
    });

    it('registra una entrada en el audit log al borrar con éxito', async () => {
      const member: any = mockUsers[3];
      component.users.set(mockUsers);
      const auditLog = TestBed.inject(AUDIT_LOG_USE_CASES as any) as any;

      await component.onDeleteUser(member);

      expect(auditLog.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'user.delete', entityId: 'u-mem1' }));
    });

    it('muestra snackbar de éxito al borrar correctamente', async () => {
      const member: any = mockUsers[3];
      component.users.set(mockUsers);
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onDeleteUser(member);

      expect(snackBar.open).toHaveBeenCalled();
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.users.delete.success', {
        email: 'mem1@test.com'
      });
    });

    it('muestra snackbar de error y NO modifica la lista si deleteUser falla', async () => {
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;
      useCases.deleteUser.mockRejectedValue(new Error('fail'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const member: any = mockUsers[3];
      component.users.set(mockUsers);

      await component.onDeleteUser(member);

      expect(snackBar.open).toHaveBeenCalled();
      expect(component.users()).toHaveLength(mockUsers.length);
    });

    it('resetea deletingUserId a null tras la operación', async () => {
      const member: any = mockUsers[3];
      component.users.set(mockUsers);

      await component.onDeleteUser(member);

      expect(component.deletingUserId()).toBeNull();
    });
  });

  describe('getRegistrationLabel', () => {
    it('devuelve una cadena no vacía para una fecha válida', () => {
      const result = component.getRegistrationLabel({ createdAt: '2025-12-01T00:00:00Z' } as any);
      expect(result.length).toBeGreaterThan(0);
    });

    it('devuelve cadena vacía para createdAt inválido', () => {
      const result = component.getRegistrationLabel({ createdAt: 'invalid' } as any);
      expect(result).toBe('');
    });

    it('usa el locale "en" cuando getActiveLang devuelve "en"', () => {
      mockTransloco.getActiveLang.mockReturnValue('en');
      const result = component.getRegistrationLabel({ createdAt: '2025-12-01T00:00:00Z' } as any);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getOwnerLabel', () => {
    it('delega en TranslocoService con la clave de owner', () => {
      component.getOwnerLabel();
      expect(mockTransloco.translate).toHaveBeenCalledWith('management.users.roleOwner');
    });
  });

  describe('_loadUsers (vía ngOnInit)', () => {
    it('carga usuarios y pone loading a false', async () => {
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;
      useCases.getAllUsers.mockResolvedValue(mockUsers);

      await component.ngOnInit();

      expect(component.users()).toEqual(mockUsers);
      expect(component.loading()).toBe(false);
    });

    it('muestra snackbar de error y pone loading a false si la carga falla', async () => {
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;
      useCases.getAllUsers.mockRejectedValue(new Error('fail'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.ngOnInit();

      expect(snackBar.open).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('pone loading a true durante la carga', async () => {
      const useCases = TestBed.inject(USER_ADMIN_USE_CASES as any) as any;
      let resolve!: (v: any[]) => void;
      useCases.getAllUsers.mockReturnValue(
        new Promise<any[]>((r) => {
          resolve = r;
        })
      );

      const loadPromise = component.ngOnInit();
      expect(component.loading()).toBe(true);
      resolve([]);
      await loadPromise;
      expect(component.loading()).toBe(false);
    });
  });
});
