import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AUTH_USE_CASES } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { authBaseImports, authBaseSchemas } from '../../auth-spec.helpers';
import { LoginComponent } from './login.component';
import { mockRouter } from '@/testing/router.mock';

const mockAuthUseCases = { signIn: vi.fn(), signInWithOAuth: vi.fn() };

/** Crea el componente configurando ActivatedRoute con el returnUrl indicado. */
function createComponent(returnUrl: string | null = null): LoginComponent {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [LoginComponent, ...authBaseImports],
    providers: [
      { provide: AUTH_USE_CASES, useValue: mockAuthUseCases },
      { provide: Router, useValue: mockRouter },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: { get: vi.fn().mockReturnValue(returnUrl) } } }
      }
    ],
    schemas: authBaseSchemas
  });
  return TestBed.createComponent(LoginComponent).componentInstance;
}

describe('LoginComponent', () => {
  let component: LoginComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    component = createComponent();
  });

  describe('estado inicial', () => {
    it('el formulario empieza inválido', () => {
      expect(component.loginForm.invalid).toBe(true);
    });
  });

  describe('validación del formulario', () => {
    it('es inválido con email vacío', () => {
      component.loginForm.setValue({ email: '', password: 'secret123' });
      expect(component.loginForm.invalid).toBe(true);
    });

    it('es inválido con email mal formado', () => {
      component.loginForm.setValue({ email: 'no-es-email', password: 'secret123' });
      expect(component.loginForm.invalid).toBe(true);
    });

    it('es inválido con password menor de 6 caracteres', () => {
      component.loginForm.setValue({ email: 'test@test.com', password: '123' });
      expect(component.loginForm.invalid).toBe(true);
    });

    it('es válido con email correcto y password suficientemente larga', () => {
      component.loginForm.setValue({ email: 'test@test.com', password: 'secret123' });
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('no llama a signIn si el formulario es inválido', async () => {
      await component.onSubmit();
      expect(mockAuthUseCases.signIn).not.toHaveBeenCalled();
    });

    it('marca todos los campos como touched si el formulario es inválido', async () => {
      await component.onSubmit();
      expect(component.loginForm.touched).toBe(true);
    });

    it('navega a /collection tras un login exitoso', async () => {
      mockAuthUseCases.signIn.mockResolvedValue({ success: true });
      component.loginForm.setValue({ email: 'test@test.com', password: 'secret123' });

      await component.onSubmit();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/collection');
    });

    it('navega al returnUrl tras login exitoso cuando viene en query params', async () => {
      component = createComponent('/orders/invite/abc');
      mockAuthUseCases.signIn.mockResolvedValue({ success: true });
      component.loginForm.setValue({ email: 'test@test.com', password: 'secret123' });

      await component.onSubmit();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/orders/invite/abc');
    });

    it('llama a signIn con el email y password del formulario', async () => {
      mockAuthUseCases.signIn.mockResolvedValue({ success: true });
      component.loginForm.setValue({ email: 'user@example.com', password: 'mypassword' });

      await component.onSubmit();

      expect(mockAuthUseCases.signIn).toHaveBeenCalledWith('user@example.com', 'mypassword');
    });

    it('pone loading a false tras completar', async () => {
      mockAuthUseCases.signIn.mockResolvedValue({ success: true });
      component.loginForm.setValue({ email: 'test@test.com', password: 'secret123' });

      await component.onSubmit();

      expect(component.loading()).toBe(false);
    });

    it('establece errorMessage con el error cuando el login falla', async () => {
      mockAuthUseCases.signIn.mockResolvedValue({ success: false, error: 'Credenciales incorrectas' });
      component.loginForm.setValue({ email: 'test@test.com', password: 'wrongpass' });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Credenciales incorrectas');
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('usa la clave de traducción como error por defecto cuando no hay mensaje', async () => {
      mockAuthUseCases.signIn.mockResolvedValue({ success: false });
      component.loginForm.setValue({ email: 'test@test.com', password: 'wrongpass' });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('auth.login.loginFailed');
    });
  });

  describe('onOAuthSignIn', () => {
    it('llama a signInWithOAuth con el provider y returnUrl null cuando no hay query param', async () => {
      mockAuthUseCases.signInWithOAuth.mockResolvedValue({ success: true });

      await component.onOAuthSignIn('google');

      expect(mockAuthUseCases.signInWithOAuth).toHaveBeenCalledWith('google', null);
    });

    it('propaga el returnUrl al signInWithOAuth cuando viene en query params', async () => {
      component = createComponent('/orders/invite/token123');
      mockAuthUseCases.signInWithOAuth.mockResolvedValue({ success: true });

      await component.onOAuthSignIn('google');

      expect(mockAuthUseCases.signInWithOAuth).toHaveBeenCalledWith('google', '/orders/invite/token123');
    });

    it('establece errorMessage cuando el proveedor falla', async () => {
      mockAuthUseCases.signInWithOAuth.mockResolvedValue({ success: false, error: 'Provider not enabled' });

      await component.onOAuthSignIn('discord');

      expect(component.errorMessage()).toBe('Provider not enabled');
    });

    it('usa la clave de traducción como fallback cuando no hay mensaje de error', async () => {
      mockAuthUseCases.signInWithOAuth.mockResolvedValue({ success: false });

      await component.onOAuthSignIn('twitch');

      expect(component.errorMessage()).toBe('auth.login.oauthFailed');
    });

    it('loading vuelve a false tras completar', async () => {
      mockAuthUseCases.signInWithOAuth.mockResolvedValue({ success: true });

      await component.onOAuthSignIn('google');

      expect(component.loading()).toBe(false);
    });
  });

  describe('returnUrl', () => {
    it('expone null cuando el query param no está presente', () => {
      expect(component.returnUrl).toBeNull();
    });

    it('expone el valor del query param cuando está presente', () => {
      component = createComponent('/orders/invite/abc');
      expect(component.returnUrl).toBe('/orders/invite/abc');
    });
  });
});
