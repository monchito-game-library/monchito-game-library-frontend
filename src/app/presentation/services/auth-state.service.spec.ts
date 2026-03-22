import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AUTH_USE_CASES, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { AuthUserModel } from '@/models/auth/auth-user.model';
import { AuthStateService } from './auth-state.service';

const mockAuthUseCases: AuthUseCasesContract = {
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updateDisplayName: vi.fn()
};

const mockRouter = { navigate: vi.fn() };

const fakeUser: AuthUserModel = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: 'https://cdn.example.com/avatar.jpg'
};

describe('AuthStateService', () => {
  let service: AuthStateService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockAuthUseCases.onAuthStateChange).mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [
        AuthStateService,
        { provide: AUTH_USE_CASES, useValue: mockAuthUseCases },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  describe('estado inicial (antes de que _initSession resuelva)', () => {
    it('loading es true inmediatamente tras la creación', () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(null);
      service = TestBed.inject(AuthStateService);

      expect(service.loading()).toBe(true);
    });

    it('currentUser es null antes de la resolución', () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(null);
      service = TestBed.inject(AuthStateService);

      expect(service.currentUser()).toBeNull();
    });
  });

  describe('después de que _initSession resuelva', () => {
    it('loading pasa a false cuando getSession devuelve null', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(null);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.loading()).toBe(false);
    });

    it('currentUser se establece con el usuario de la sesión', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(fakeUser);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.currentUser()).toEqual(fakeUser);
    });

    it('isAuthenticated devuelve true cuando hay usuario', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(fakeUser);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.isAuthenticated()).toBe(true);
    });

    it('getUserId devuelve el id del usuario', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(fakeUser);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.getUserId()).toBe('user-1');
    });

    it('getUserEmail devuelve el email del usuario', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(fakeUser);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.getUserEmail()).toBe('test@example.com');
    });

    it('getDisplayName devuelve el nombre del usuario', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(fakeUser);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.getDisplayName()).toBe('Test User');
    });

    it('getAvatarUrl devuelve la URL del avatar', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(fakeUser);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.getAvatarUrl()).toBe('https://cdn.example.com/avatar.jpg');
    });

    it('isAuthenticated devuelve false cuando no hay sesión', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(null);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.isAuthenticated()).toBe(false);
    });

    it('getUserId devuelve null cuando no hay sesión', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(null);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.getUserId()).toBeNull();
    });

    it('getDisplayName devuelve cadena vacía cuando no hay sesión', async () => {
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(null);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      expect(service.getDisplayName()).toBe('');
    });
  });

  describe('onAuthStateChange', () => {
    it('navega a /auth/login cuando el usuario pasa de autenticado a null', async () => {
      let capturedCallback: ((user: AuthUserModel | null) => void) | null = null;
      vi.mocked(mockAuthUseCases.onAuthStateChange).mockImplementation((cb) => {
        capturedCallback = cb;
      });
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(fakeUser);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      capturedCallback!(null);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('no navega cuando el usuario se actualiza con un nuevo usuario', async () => {
      let capturedCallback: ((user: AuthUserModel | null) => void) | null = null;
      vi.mocked(mockAuthUseCases.onAuthStateChange).mockImplementation((cb) => {
        capturedCallback = cb;
      });
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(fakeUser);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      const updatedUser: AuthUserModel = { ...fakeUser, displayName: 'New Name' };
      capturedCallback!(updatedUser);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('no navega si el usuario era null antes del cambio', async () => {
      let capturedCallback: ((user: AuthUserModel | null) => void) | null = null;
      vi.mocked(mockAuthUseCases.onAuthStateChange).mockImplementation((cb) => {
        capturedCallback = cb;
      });
      vi.mocked(mockAuthUseCases.getSession).mockResolvedValue(null);
      service = TestBed.inject(AuthStateService);
      await Promise.resolve();

      capturedCallback!(null);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
