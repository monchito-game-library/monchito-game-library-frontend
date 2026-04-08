import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { OrderInviteComponent } from './order-invite.component';
import { ORDERS_USE_CASES } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { AuthStateService } from '@/services/auth-state.service';
import { UserContextService } from '@/services/user-context.service';
import { OrderInvitationModel } from '@/models/order/order-invitation.model';

function makeInvitation(overrides: Partial<OrderInvitationModel> = {}): OrderInvitationModel {
  return {
    id: 'invite-1',
    token: 'test-token',
    orderId: 'order-1',
    orderTitle: 'Pedido de prueba',
    orderCreatedAt: '2024-01-01T00:00:00Z',
    orderDate: null,
    orderMemberCount: 1,
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: '2099-01-01T00:00:00Z',
    usedBy: null,
    ...overrides
  };
}

describe('OrderInviteComponent', () => {
  let component: OrderInviteComponent;
  let fixture: ComponentFixture<OrderInviteComponent>;

  const mockOrdersUseCases = {
    getInvitationByToken: vi.fn(),
    acceptInvitation: vi.fn()
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn().mockReturnValue('test-token')
      }
    }
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockAuthState = {
    isAuthenticated: vi.fn()
  };

  const mockUserContext = {
    userId: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('test-token');

    TestBed.configureTestingModule({
      imports: [
        OrderInviteComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: ORDERS_USE_CASES, useValue: mockOrdersUseCases },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: AuthStateService, useValue: mockAuthState },
        { provide: UserContextService, useValue: mockUserContext }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(OrderInviteComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('loading es false', () => {
      expect(component.loading()).toBe(false);
    });

    it('joining es false', () => {
      expect(component.joining()).toBe(false);
    });

    it('invitation es null', () => {
      expect(component.invitation()).toBeNull();
    });

    it('invalid es false', () => {
      expect(component.invalid()).toBe(false);
    });

    it('alreadyMember es false', () => {
      expect(component.alreadyMember()).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('no llama a getInvitationByToken cuando el usuario no está autenticado', async () => {
      mockAuthState.isAuthenticated.mockReturnValue(false);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockOrdersUseCases.getInvitationByToken).not.toHaveBeenCalled();
    });

    it('loading permanece false cuando el usuario no está autenticado', async () => {
      mockAuthState.isAuthenticated.mockReturnValue(false);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.loading()).toBe(false);
    });

    it('llama a getInvitationByToken con el token cuando está autenticado', async () => {
      mockAuthState.isAuthenticated.mockReturnValue(true);
      mockOrdersUseCases.getInvitationByToken.mockResolvedValue(makeInvitation());

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockOrdersUseCases.getInvitationByToken).toHaveBeenCalledWith('test-token');
    });

    it('actualiza la señal invitation con el resultado cuando la invitación es válida', async () => {
      const invite = makeInvitation();
      mockAuthState.isAuthenticated.mockReturnValue(true);
      mockOrdersUseCases.getInvitationByToken.mockResolvedValue(invite);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.invitation()).toEqual(invite);
    });

    it('pone invalid a true cuando el resultado es null', async () => {
      mockAuthState.isAuthenticated.mockReturnValue(true);
      mockOrdersUseCases.getInvitationByToken.mockResolvedValue(null);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.invalid()).toBe(true);
    });

    it('pone alreadyMember a true cuando la invitación tiene usedBy definido', async () => {
      const invite = makeInvitation({ usedBy: 'user-other' });
      mockAuthState.isAuthenticated.mockReturnValue(true);
      mockOrdersUseCases.getInvitationByToken.mockResolvedValue(invite);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.alreadyMember()).toBe(true);
    });

    it('también establece invitation cuando la invitación tiene usedBy definido', async () => {
      const invite = makeInvitation({ usedBy: 'user-other' });
      mockAuthState.isAuthenticated.mockReturnValue(true);
      mockOrdersUseCases.getInvitationByToken.mockResolvedValue(invite);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.invitation()).toEqual(invite);
    });

    it('pone invalid a true cuando getInvitationByToken lanza una excepción', async () => {
      mockAuthState.isAuthenticated.mockReturnValue(true);
      mockOrdersUseCases.getInvitationByToken.mockRejectedValue(new Error('token inválido'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.invalid()).toBe(true);
    });

    it('pone invalid a true inmediatamente cuando el token es cadena vacía', async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('');
      mockAuthState.isAuthenticated.mockReturnValue(true);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.invalid()).toBe(true);
      expect(mockOrdersUseCases.getInvitationByToken).not.toHaveBeenCalled();
    });

    it('loading termina en false tras la carga exitosa', async () => {
      mockAuthState.isAuthenticated.mockReturnValue(true);
      mockOrdersUseCases.getInvitationByToken.mockResolvedValue(makeInvitation());

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.loading()).toBe(false);
    });

    it('loading termina en false aunque getInvitationByToken rechace', async () => {
      mockAuthState.isAuthenticated.mockReturnValue(true);
      mockOrdersUseCases.getInvitationByToken.mockRejectedValue(new Error('fallo'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.loading()).toBe(false);
    });
  });

  describe('onGoToLogin()', () => {
    it('navega a /auth/login con returnUrl apuntando a la página de invitación', () => {
      mockAuthState.isAuthenticated.mockReturnValue(false);
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('test-token');

      fixture.detectChanges();

      component.onGoToLogin();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/orders/invite/test-token' }
      });
    });
  });

  describe('onJoin()', () => {
    it('no hace nada cuando userId es null', async () => {
      mockUserContext.userId.mockReturnValue(null);

      await component.onJoin();

      expect(mockOrdersUseCases.acceptInvitation).not.toHaveBeenCalled();
    });

    it('llama a acceptInvitation con el token y userId', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.acceptInvitation.mockResolvedValue('order-1');
      mockRouter.navigate.mockResolvedValue(true);

      // Simular que el token fue leído en ngOnInit
      (component as any)._token = 'test-token';

      await component.onJoin();

      expect(mockOrdersUseCases.acceptInvitation).toHaveBeenCalledWith('test-token', 'user-1');
    });

    it('navega a /orders/:orderId tras aceptar la invitación correctamente', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.acceptInvitation.mockResolvedValue('order-1');
      mockRouter.navigate.mockResolvedValue(true);

      (component as any)._token = 'test-token';

      await component.onJoin();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders', 'order-1']);
    });

    it('pone invalid a true cuando acceptInvitation lanza una excepción', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.acceptInvitation.mockRejectedValue(new Error('invitación expirada'));

      (component as any)._token = 'test-token';

      await component.onJoin();

      expect(component.invalid()).toBe(true);
    });

    it('pone joining a true durante la operación', async () => {
      mockUserContext.userId.mockReturnValue('user-1');

      let resolveAccept!: (value: string) => void;
      const acceptPromise = new Promise<string>((res) => {
        resolveAccept = res;
      });
      mockOrdersUseCases.acceptInvitation.mockReturnValue(acceptPromise);
      mockRouter.navigate.mockResolvedValue(true);

      (component as any)._token = 'test-token';

      const joinPromise = component.onJoin();

      expect(component.joining()).toBe(true);

      resolveAccept('order-1');
      await joinPromise;
    });

    it('joining termina en false tras la operación exitosa', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.acceptInvitation.mockResolvedValue('order-1');
      mockRouter.navigate.mockResolvedValue(true);

      (component as any)._token = 'test-token';

      await component.onJoin();

      expect(component.joining()).toBe(false);
    });

    it('joining termina en false aunque acceptInvitation rechace (bloque finally)', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.acceptInvitation.mockRejectedValue(new Error('fallo'));

      (component as any)._token = 'test-token';

      await component.onJoin();

      expect(component.joining()).toBe(false);
    });
  });
});
