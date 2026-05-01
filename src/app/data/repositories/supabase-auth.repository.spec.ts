import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseAuthRepository } from './supabase-auth.repository';

const fakeUser = {
  id: 'user-1',
  email: 'test@example.com',
  user_metadata: { display_name: 'Test User', avatar_url: 'https://cdn.example.com/avatar.jpg' }
};

describe('SupabaseAuthRepository', () => {
  let repo: SupabaseAuthRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseAuthRepository]
    });
    repo = TestBed.inject(SupabaseAuthRepository);
  });

  describe('getSession', () => {
    it('devuelve el usuario mapeado cuando hay sesión activa', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: fakeUser } } });

      const result = await repo.getSession();

      expect(result).not.toBeNull();
      expect(result!.id).toBe('user-1');
      expect(result!.displayName).toBe('Test User');
      expect(result!.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');
    });

    it('devuelve null cuando no hay sesión', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

      expect(await repo.getSession()).toBeNull();
    });

    it('mapea email a null y displayName a null cuando el usuario no tiene email ni metadata', async () => {
      const userWithoutEmail = { id: 'user-2', user_metadata: {} };
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: userWithoutEmail } } });

      const result = await repo.getSession();

      expect(result!.email).toBeNull();
      expect(result!.displayName).toBeNull();
      expect(result!.avatarUrl).toBeNull();
    });

    it('usa full_name de metadata como displayName para usuarios OAuth', async () => {
      const oauthUser = { id: 'user-3', email: 'test@gmail.com', user_metadata: { full_name: 'Juan García' } };
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: oauthUser } } });

      const result = await repo.getSession();

      expect(result!.displayName).toBe('Juan García');
    });

    it('usa el prefijo del email como displayName cuando no hay display_name ni full_name en metadata', async () => {
      const userWithoutDisplayName = { id: 'user-4', email: 'test@example.com', user_metadata: {} };
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: userWithoutDisplayName } }
      });

      const result = await repo.getSession();

      expect(result!.displayName).toBe('test');
    });

    it('display_name tiene prioridad sobre full_name', async () => {
      const userWithBoth = {
        id: 'user-5',
        email: 'test@example.com',
        user_metadata: { display_name: 'Nombre Personalizado', full_name: 'Nombre OAuth' }
      };
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: userWithBoth } } });

      const result = await repo.getSession();

      expect(result!.displayName).toBe('Nombre Personalizado');
    });
  });

  describe('signIn', () => {
    it('devuelve el usuario mapeado tras login correcto', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: fakeUser }, error: null });

      const result = await repo.signIn('test@example.com', 'password');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('lanza error cuando el login falla', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      });

      await expect(repo.signIn('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('lanza "Login failed" cuando error es null pero user también es null', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error: null });

      await expect(repo.signIn('test@example.com', 'pass')).rejects.toThrow('Login failed');
    });
  });

  describe('signUp', () => {
    it('registra con displayName explícito', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { user: fakeUser }, error: null });

      const result = await repo.signUp('test@example.com', 'pass', 'Test User');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ data: { display_name: 'Test User' } })
        })
      );
      expect(result.id).toBe('user-1');
    });

    it('usa el prefijo del email como displayName por defecto', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { user: fakeUser }, error: null });

      await repo.signUp('test@example.com', 'pass');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ data: { display_name: 'test' } })
        })
      );
    });

    it('usa window.location.origin como emailRedirectTo cuando no hay returnUrl', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { user: fakeUser }, error: null });

      await repo.signUp('test@example.com', 'pass');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ emailRedirectTo: window.location.origin })
        })
      );
    });

    it('compone emailRedirectTo a partir del returnUrl cuando se proporciona', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { user: fakeUser }, error: null });

      await repo.signUp('test@example.com', 'pass', 'Test User', '/orders/invite/abc');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: `${window.location.origin}/orders/invite/abc`
          })
        })
      );
    });

    it('lanza error cuando el registro falla', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already registered' }
      });

      await expect(repo.signUp('dup@test.com', 'pass')).rejects.toThrow('Email already registered');
    });

    it('lanza "Registration failed" cuando error es null pero user también es null', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { user: null }, error: null });

      await expect(repo.signUp('test@example.com', 'pass')).rejects.toThrow('Registration failed');
    });

    it('no toca user_preferences (lo crea el trigger handle_new_user)', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { user: fakeUser }, error: null });
      mockSupabase.from.mockClear();

      await repo.signUp('test@example.com', 'pass');

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('llama a auth.signOut sin lanzar errores', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await expect(repo.signOut()).resolves.toBeUndefined();
      expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce();
    });

    it('lanza error si signOut falla', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: { message: 'Network error' } });

      await expect(repo.signOut()).rejects.toThrow('Network error');
    });
  });

  describe('resetPassword', () => {
    it('llama a resetPasswordForEmail sin lanzar errores', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await expect(repo.resetPassword('test@example.com')).resolves.toBeUndefined();
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') })
      );
    });

    it('lanza error si resetPasswordForEmail falla', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: { message: 'Rate limit exceeded' } });

      await expect(repo.resetPassword('test@example.com')).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('onAuthStateChange', () => {
    it('registra el listener en supabase.auth', () => {
      // Clear the constructor's early listener call before asserting
      mockSupabase.auth.onAuthStateChange.mockClear();
      mockSupabase.auth.onAuthStateChange.mockImplementation(() => {});
      const callback = vi.fn();

      repo.onAuthStateChange(callback);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledOnce();
    });

    it('llama al callback con null cuando la sesión es null', () => {
      let captured: ((event: string, session: any) => void) | null = null;
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
        captured = cb;
      });
      const callback = vi.fn();

      repo.onAuthStateChange(callback);
      captured!('SIGNED_OUT', null);

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('llama al callback con el usuario mapeado cuando la sesión tiene usuario', () => {
      let captured: ((event: string, session: any) => void) | null = null;
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
        captured = cb;
      });
      const callback = vi.fn();

      repo.onAuthStateChange(callback);
      captured!('SIGNED_IN', { user: fakeUser });

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }));
    });
  });

  describe('updateDisplayName', () => {
    it('llama a auth.updateUser con el nuevo nombre', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null });

      await repo.updateDisplayName('New Name');

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ data: { display_name: 'New Name' } });
    });

    it('lanza error si updateUser falla', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: { message: 'Update failed' } });

      await expect(repo.updateDisplayName('New Name')).rejects.toThrow('Failed to update display name');
    });
  });

  describe('updatePassword', () => {
    it('actualiza la contraseña sin lanzar errores', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null });

      await expect(repo.updatePassword('newPass123')).resolves.toBeUndefined();
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newPass123' });
    });

    it('lanza error si updateUser falla', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: { message: 'Password too weak' } });

      await expect(repo.updatePassword('weak')).rejects.toThrow('Password too weak');
    });
  });

  describe('signInWithOAuth', () => {
    it('usa window.location.origin como redirectTo cuando no hay returnUrl', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });

      await repo.signInWithOAuth('google');

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    });

    it('compone redirectTo a partir del returnUrl cuando se proporciona', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });

      await repo.signInWithOAuth('google', '/orders/invite/abc');

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/orders/invite/abc` }
      });
    });

    it('funciona con provider twitch', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });

      await expect(repo.signInWithOAuth('twitch')).resolves.toBeUndefined();
    });

    it('lanza error si signInWithOAuth falla', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: { message: 'Provider not enabled' } });

      await expect(repo.signInWithOAuth('google')).rejects.toThrow('Provider not enabled');
    });
  });

  describe('constructor — registro temprano de onAuthStateChange', () => {
    it('registra _passwordRecoveryDetected=true cuando el callback del constructor recibe PASSWORD_RECOVERY', () => {
      const constructorCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0] as (event: string) => void;

      constructorCallback('PASSWORD_RECOVERY');

      expect((repo as any)._passwordRecoveryDetected).toBe(true);
    });

    it('no modifica _passwordRecoveryDetected para otros eventos en el callback del constructor', () => {
      const constructorCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0] as (event: string) => void;

      constructorCallback('SIGNED_IN');

      expect((repo as any)._passwordRecoveryDetected).toBe(false);
    });
  });

  describe('onPasswordRecovery', () => {
    it('llama al callback cuando el evento es PASSWORD_RECOVERY', () => {
      let captured: ((event: string) => void) | null = null;
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
        captured = cb;
      });
      const callback = vi.fn();

      repo.onPasswordRecovery(callback);
      captured!('PASSWORD_RECOVERY');

      expect(callback).toHaveBeenCalledOnce();
    });

    it('no llama al callback para otros eventos de auth', () => {
      let captured: ((event: string) => void) | null = null;
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
        captured = cb;
      });
      const callback = vi.fn();

      repo.onPasswordRecovery(callback);
      captured!('SIGNED_IN');

      expect(callback).not.toHaveBeenCalled();
    });

    it('llama al callback inmediatamente si PASSWORD_RECOVERY ya fue detectado previamente', () => {
      (repo as any)._passwordRecoveryDetected = true;
      mockSupabase.auth.onAuthStateChange.mockClear();
      const callback = vi.fn();

      repo.onPasswordRecovery(callback);

      expect(callback).toHaveBeenCalledOnce();
      expect(mockSupabase.auth.onAuthStateChange).not.toHaveBeenCalled();
    });
  });
});
