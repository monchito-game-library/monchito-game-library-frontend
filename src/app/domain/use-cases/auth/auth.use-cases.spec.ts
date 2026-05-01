import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AUTH_REPOSITORY, AuthRepositoryContract } from '@/domain/repositories/auth.repository.contract';
import { AuthUserModel } from '@/models/auth/auth-user.model';
import { AuthUseCasesImpl } from './auth.use-cases';

const mockUser: AuthUserModel = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: null
};

const mockRepo: AuthRepositoryContract = {
  getSession: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  onAuthStateChange: vi.fn(),
  updateDisplayName: vi.fn(),
  updatePassword: vi.fn(),
  onPasswordRecovery: vi.fn(),
  signInWithOAuth: vi.fn()
};

describe('AuthUseCasesImpl', () => {
  let useCases: AuthUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [AuthUseCasesImpl, { provide: AUTH_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(AuthUseCasesImpl);
  });

  describe('getSession', () => {
    it('devuelve el usuario de sesión activa', async () => {
      vi.mocked(mockRepo.getSession).mockResolvedValue(mockUser);
      const result = await useCases.getSession();

      expect(result).toBe(mockUser);
    });

    it('devuelve null si no hay sesión', async () => {
      vi.mocked(mockRepo.getSession).mockResolvedValue(null);
      expect(await useCases.getSession()).toBeNull();
    });
  });

  describe('signIn', () => {
    it('devuelve { success: true } cuando el repositorio resuelve correctamente', async () => {
      vi.mocked(mockRepo.signIn).mockResolvedValue(mockUser);
      const result = await useCases.signIn('test@example.com', 'password123');

      expect(result).toEqual({ success: true });
      expect(mockRepo.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('devuelve { success: false, error } cuando el repositorio lanza un Error', async () => {
      vi.mocked(mockRepo.signIn).mockRejectedValue(new Error('Invalid credentials'));
      const result = await useCases.signIn('test@example.com', 'wrong');

      expect(result).toEqual({ success: false, error: 'Invalid credentials' });
    });

    it('devuelve el mensaje genérico cuando el repositorio lanza un valor no Error', async () => {
      vi.mocked(mockRepo.signIn).mockRejectedValue('unknown error');
      const result = await useCases.signIn('test@example.com', 'wrong');

      expect(result).toEqual({ success: false, error: 'Login failed' });
    });
  });

  describe('signUp', () => {
    it('devuelve { success: true } cuando el repositorio resuelve', async () => {
      vi.mocked(mockRepo.signUp).mockResolvedValue(mockUser);
      const result = await useCases.signUp('new@example.com', 'pass', 'Nombre');

      expect(result).toEqual({ success: true });
      expect(mockRepo.signUp).toHaveBeenCalledWith('new@example.com', 'pass', 'Nombre', undefined);
    });

    it('propaga returnUrl al repositorio cuando se proporciona', async () => {
      vi.mocked(mockRepo.signUp).mockResolvedValue(mockUser);

      await useCases.signUp('new@example.com', 'pass', 'Nombre', '/orders/invite/abc');

      expect(mockRepo.signUp).toHaveBeenCalledWith('new@example.com', 'pass', 'Nombre', '/orders/invite/abc');
    });

    it('devuelve { success: false, error } cuando el repositorio lanza', async () => {
      vi.mocked(mockRepo.signUp).mockRejectedValue(new Error('Email already in use'));
      const result = await useCases.signUp('existing@example.com', 'pass');

      expect(result).toEqual({ success: false, error: 'Email already in use' });
    });

    it('devuelve mensaje genérico cuando el repositorio lanza un valor no Error', async () => {
      vi.mocked(mockRepo.signUp).mockRejectedValue('unknown error');
      const result = await useCases.signUp('new@example.com', 'pass');

      expect(result).toEqual({ success: false, error: 'Registration failed' });
    });
  });

  describe('resetPassword', () => {
    it('devuelve { success: true } cuando el repositorio resuelve', async () => {
      vi.mocked(mockRepo.resetPassword).mockResolvedValue();
      const result = await useCases.resetPassword('test@example.com');

      expect(result).toEqual({ success: true });
    });

    it('devuelve { success: false, error } cuando el repositorio lanza', async () => {
      vi.mocked(mockRepo.resetPassword).mockRejectedValue(new Error('User not found'));
      const result = await useCases.resetPassword('unknown@example.com');

      expect(result).toEqual({ success: false, error: 'User not found' });
    });

    it('devuelve mensaje genérico para errores no-Error', async () => {
      vi.mocked(mockRepo.resetPassword).mockRejectedValue(null);
      const result = await useCases.resetPassword('test@example.com');

      expect(result).toEqual({ success: false, error: 'Failed to send reset email' });
    });
  });

  describe('signOut', () => {
    it('delega en repo.signOut', async () => {
      vi.mocked(mockRepo.signOut).mockResolvedValue();
      await useCases.signOut();

      expect(mockRepo.signOut).toHaveBeenCalledOnce();
    });
  });

  describe('onAuthStateChange', () => {
    it('delega en repo.onAuthStateChange', () => {
      const callback = vi.fn();
      useCases.onAuthStateChange(callback);

      expect(mockRepo.onAuthStateChange).toHaveBeenCalledWith(callback);
    });
  });

  describe('updateDisplayName', () => {
    it('delega en repo.updateDisplayName', async () => {
      vi.mocked(mockRepo.updateDisplayName).mockResolvedValue();
      await useCases.updateDisplayName('Nuevo nombre');

      expect(mockRepo.updateDisplayName).toHaveBeenCalledWith('Nuevo nombre');
    });
  });

  describe('updatePassword', () => {
    it('devuelve { success: true } cuando el repositorio resuelve', async () => {
      vi.mocked(mockRepo.updatePassword).mockResolvedValue();
      const result = await useCases.updatePassword('newPass123');

      expect(result).toEqual({ success: true });
      expect(mockRepo.updatePassword).toHaveBeenCalledWith('newPass123');
    });

    it('devuelve { success: false, error } cuando el repositorio lanza un Error', async () => {
      vi.mocked(mockRepo.updatePassword).mockRejectedValue(new Error('Auth error'));
      const result = await useCases.updatePassword('newPass123');

      expect(result).toEqual({ success: false, error: 'Auth error' });
    });

    it('devuelve mensaje genérico cuando el repositorio lanza un valor no Error', async () => {
      vi.mocked(mockRepo.updatePassword).mockRejectedValue('unexpected');
      const result = await useCases.updatePassword('newPass123');

      expect(result).toEqual({ success: false, error: 'Failed to update password' });
    });
  });

  describe('onPasswordRecovery', () => {
    it('delega en repo.onPasswordRecovery', () => {
      const callback = vi.fn();
      useCases.onPasswordRecovery(callback);

      expect(mockRepo.onPasswordRecovery).toHaveBeenCalledWith(callback);
    });
  });

  describe('signInWithOAuth', () => {
    it('devuelve { success: true } cuando el repositorio resuelve', async () => {
      vi.mocked(mockRepo.signInWithOAuth).mockResolvedValue();
      const result = await useCases.signInWithOAuth('google');

      expect(result).toEqual({ success: true });
      expect(mockRepo.signInWithOAuth).toHaveBeenCalledWith('google', undefined);
    });

    it('propaga returnUrl al repositorio cuando se proporciona', async () => {
      vi.mocked(mockRepo.signInWithOAuth).mockResolvedValue();

      await useCases.signInWithOAuth('google', '/orders/invite/abc');

      expect(mockRepo.signInWithOAuth).toHaveBeenCalledWith('google', '/orders/invite/abc');
    });

    it('devuelve { success: false, error } cuando el repositorio lanza un Error', async () => {
      vi.mocked(mockRepo.signInWithOAuth).mockRejectedValue(new Error('Provider not enabled'));
      const result = await useCases.signInWithOAuth('discord');

      expect(result).toEqual({ success: false, error: 'Provider not enabled' });
    });

    it('devuelve mensaje genérico cuando el repositorio lanza un valor no Error', async () => {
      vi.mocked(mockRepo.signInWithOAuth).mockRejectedValue('unexpected');
      const result = await useCases.signInWithOAuth('twitch');

      expect(result).toEqual({ success: false, error: 'OAuth sign-in failed' });
    });
  });
});
