import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AUTH_USE_CASES, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { AuthStateService } from '@/services/auth-state/auth-state.service';
import { UserContextService } from './user-context.service';

const mockAuthState: Partial<AuthStateService> = {
  getUserId: vi.fn(),
  isAuthenticated: vi.fn(),
  getUserEmail: vi.fn(),
  getDisplayName: vi.fn(),
  getAvatarUrl: vi.fn()
};

const mockAuthUseCases: Partial<AuthUseCasesContract> = {
  signOut: vi.fn()
};

describe('UserContextService', () => {
  let service: UserContextService;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        UserContextService,
        { provide: AuthStateService, useValue: mockAuthState },
        { provide: AUTH_USE_CASES, useValue: mockAuthUseCases }
      ]
    });

    service = TestBed.inject(UserContextService);
  });

  describe('userId', () => {
    it('devuelve el id del usuario autenticado', () => {
      vi.mocked(mockAuthState.getUserId!).mockReturnValue('user-1');

      expect(service.userId()).toBe('user-1');
    });

    it('devuelve null cuando no hay sesión', () => {
      vi.mocked(mockAuthState.getUserId!).mockReturnValue(null);

      expect(service.userId()).toBeNull();
    });
  });

  describe('isUserSelected', () => {
    it('devuelve true cuando hay usuario autenticado', () => {
      vi.mocked(mockAuthState.isAuthenticated!).mockReturnValue(true);

      expect(service.isUserSelected()).toBe(true);
    });

    it('devuelve false cuando no hay usuario', () => {
      vi.mocked(mockAuthState.isAuthenticated!).mockReturnValue(false);

      expect(service.isUserSelected()).toBe(false);
    });
  });

  describe('getUserEmail', () => {
    it('delega en authState.getUserEmail', () => {
      vi.mocked(mockAuthState.getUserEmail!).mockReturnValue('test@example.com');

      expect(service.getUserEmail()).toBe('test@example.com');
    });

    it('devuelve null cuando no hay sesión', () => {
      vi.mocked(mockAuthState.getUserEmail!).mockReturnValue(null);

      expect(service.getUserEmail()).toBeNull();
    });
  });

  describe('getDisplayName', () => {
    it('delega en authState.getDisplayName', () => {
      vi.mocked(mockAuthState.getDisplayName!).mockReturnValue('Test User');

      expect(service.getDisplayName()).toBe('Test User');
    });
  });

  describe('getAvatarUrl', () => {
    it('devuelve la URL del avatar si existe', () => {
      vi.mocked(mockAuthState.getAvatarUrl!).mockReturnValue('https://cdn.example.com/avatar.jpg');
      vi.mocked(mockAuthState.getDisplayName!).mockReturnValue('Test User');

      expect(service.getAvatarUrl()).toBe('https://cdn.example.com/avatar.jpg');
    });

    it('genera URL de ui-avatars.com cuando no hay avatar', () => {
      vi.mocked(mockAuthState.getAvatarUrl!).mockReturnValue(null);
      vi.mocked(mockAuthState.getDisplayName!).mockReturnValue('Test User');

      const url = service.getAvatarUrl();

      expect(url).toContain('ui-avatars.com');
      expect(url).toContain(encodeURIComponent('Test User'));
    });

    it('la URL de fallback incluye los parámetros de estilo correctos', () => {
      vi.mocked(mockAuthState.getAvatarUrl!).mockReturnValue(null);
      vi.mocked(mockAuthState.getDisplayName!).mockReturnValue('Ana');

      const url = service.getAvatarUrl();

      expect(url).toContain('background=random');
      expect(url).toContain('color=fff');
      expect(url).toContain('size=128');
    });
  });

  describe('requireUserId', () => {
    it('devuelve el id cuando hay sesión', () => {
      vi.mocked(mockAuthState.getUserId!).mockReturnValue('user-1');

      expect(service.requireUserId()).toBe('user-1');
    });

    it('lanza Error cuando no hay sesión', () => {
      vi.mocked(mockAuthState.getUserId!).mockReturnValue(null);

      expect(() => service.requireUserId()).toThrow('No user selected');
    });
  });

  describe('clearUser', () => {
    it('delega en authUseCases.signOut', () => {
      vi.mocked(mockAuthUseCases.signOut!).mockResolvedValue();

      service.clearUser();

      expect(mockAuthUseCases.signOut).toHaveBeenCalledOnce();
    });
  });
});
