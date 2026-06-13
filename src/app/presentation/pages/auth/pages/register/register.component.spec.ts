import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AUTH_USE_CASES } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { authBaseImports, authBaseProviders, authBaseSchemas } from '../../auth-spec.helpers';
import { RegisterComponent } from './register.component';
import { mockRouter } from '@/testing/router.mock';

const mockAuthUseCases = { signUp: vi.fn(), signInWithOAuth: vi.fn() };

describe('RegisterComponent', () => {
  let component: RegisterComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [RegisterComponent, ...authBaseImports],
      providers: [
        { provide: AUTH_USE_CASES, useValue: mockAuthUseCases },
        { provide: Router, useValue: mockRouter },
        ...authBaseProviders
      ],
      schemas: authBaseSchemas
    });
    component = TestBed.createComponent(RegisterComponent).componentInstance;
    // Reset del mock compartido de ActivatedRoute (las pruebas que necesitan returnUrl
    // lo sobreescriben puntualmente; este reset evita fugas entre tests).
    (component as any)._route.snapshot.queryParamMap.get = () => null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('estado inicial', () => {
    it('hideConfirmPassword empieza en true', () => {
      expect(component.hideConfirmPassword()).toBe(true);
    });

    it('el formulario empieza inválido', () => {
      expect(component.registerForm.invalid).toBe(true);
    });
  });

  describe('toggleConfirmPasswordVisibility', () => {
    it('alterna hideConfirmPassword', () => {
      component.toggleConfirmPasswordVisibility();
      expect(component.hideConfirmPassword()).toBe(false);
    });
  });

  describe('validación del formulario', () => {
    it('es inválido si displayName tiene menos de 3 caracteres', () => {
      component.registerForm.setValue({
        displayName: 'Ab',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });
      expect(component.registerForm.invalid).toBe(true);
    });

    it('es inválido con email mal formado', () => {
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'no-email',
        password: 'pass123',
        confirmPassword: 'pass123'
      });
      expect(component.registerForm.invalid).toBe(true);
    });

    it('es inválido con password menor de 6 caracteres', () => {
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: '123',
        confirmPassword: '123'
      });
      expect(component.registerForm.invalid).toBe(true);
    });

    it('es inválido cuando las contraseñas no coinciden', () => {
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'different'
      });
      expect(component.registerForm.errors).toEqual({ passwordMismatch: true });
    });

    it('es válido con todos los campos correctos y contraseñas iguales', () => {
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });
      expect(component.registerForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('no llama a signUp si el formulario es inválido', async () => {
      await component.onSubmit();
      expect(mockAuthUseCases.signUp).not.toHaveBeenCalled();
    });

    it('llama a signUp con displayName, email y password correctos', async () => {
      mockAuthUseCases.signUp.mockResolvedValue({ success: true });
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      await component.onSubmit();

      expect(mockAuthUseCases.signUp).toHaveBeenCalledWith('a@b.com', 'pass123', 'Alice', null);
    });

    it('propaga returnUrl al signUp cuando viene en query params', async () => {
      mockAuthUseCases.signUp.mockResolvedValue({ success: true });
      (component as any)._route.snapshot.queryParamMap.get = vi.fn().mockReturnValue('/orders/invite/abc');
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      await component.onSubmit();

      expect(mockAuthUseCases.signUp).toHaveBeenCalledWith('a@b.com', 'pass123', 'Alice', '/orders/invite/abc');
    });

    it('establece successMessage tras un registro exitoso', async () => {
      mockAuthUseCases.signUp.mockResolvedValue({ success: true });
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      await component.onSubmit();

      expect(component.successMessage()).toBe('auth.register.successMessage');
    });

    it('navega a /auth/login 3 segundos después del éxito', async () => {
      mockAuthUseCases.signUp.mockResolvedValue({ success: true });
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      await component.onSubmit();
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      vi.advanceTimersByTime(3000);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('preserva returnUrl al navegar a /auth/login tras el éxito', async () => {
      mockAuthUseCases.signUp.mockResolvedValue({ success: true });
      (component as any)._route.snapshot.queryParamMap.get = vi.fn().mockReturnValue('/orders/invite/abc');
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      await component.onSubmit();
      vi.advanceTimersByTime(3000);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/orders/invite/abc' }
      });
    });

    it('establece errorMessage cuando el registro falla', async () => {
      mockAuthUseCases.signUp.mockResolvedValue({ success: false, error: 'Email ya registrado' });
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Email ya registrado');
      expect(component.successMessage()).toBe('');
    });

    it('usa la clave de traducción como error por defecto', async () => {
      mockAuthUseCases.signUp.mockResolvedValue({ success: false });
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('auth.register.registrationFailed');
    });

    it('loading vuelve a false tras completar', async () => {
      mockAuthUseCases.signUp.mockResolvedValue({ success: true });
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      await component.onSubmit();

      expect(component.loading()).toBe(false);
    });
  });

  describe('onOAuthSignIn', () => {
    it('llama a signInWithOAuth con el provider y returnUrl null cuando no hay query param', async () => {
      mockAuthUseCases.signInWithOAuth.mockResolvedValue({ success: true });

      await component.onOAuthSignIn('google');

      expect(mockAuthUseCases.signInWithOAuth).toHaveBeenCalledWith('google', null);
    });

    it('propaga el returnUrl al signInWithOAuth cuando viene en query params', async () => {
      mockAuthUseCases.signInWithOAuth.mockResolvedValue({ success: true });
      (component as any)._route.snapshot.queryParamMap.get = vi.fn().mockReturnValue('/orders/invite/token123');

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

      expect(component.errorMessage()).toBe('auth.register.oauthFailed');
    });

    it('loading vuelve a false tras completar', async () => {
      mockAuthUseCases.signInWithOAuth.mockResolvedValue({ success: true });

      await component.onOAuthSignIn('google');

      expect(component.loading()).toBe(false);
    });
  });

  describe('_getDisplayNameError', () => {
    it('devuelve null cuando el campo no ha sido tocado', () => {
      expect(component._getDisplayNameError()).toBeNull();
    });

    it('devuelve null cuando el campo es válido y está tocado', () => {
      component.registerForm.get('displayName')!.setValue('Alice');
      component.registerForm.get('displayName')!.markAsTouched();
      expect(component._getDisplayNameError()).toBeNull();
    });

    it('devuelve la clave de required cuando está tocado y vacío', () => {
      component.registerForm.get('displayName')!.markAsTouched();
      component.registerForm.get('displayName')!.setValue('');
      expect(component._getDisplayNameError()).toBe('auth.register.displayNameRequired');
    });

    it('devuelve la clave de minlength cuando el nombre es demasiado corto', () => {
      component.registerForm.get('displayName')!.markAsTouched();
      component.registerForm.get('displayName')!.setValue('Al');
      expect(component._getDisplayNameError()).toBe('auth.register.displayNameMinLength');
    });
  });

  describe('_getEmailError', () => {
    it('devuelve null cuando el campo no ha sido tocado', () => {
      expect(component._getEmailError()).toBeNull();
    });

    it('devuelve null cuando el campo es válido y está tocado', () => {
      component.registerForm.get('email')!.setValue('user@test.com');
      component.registerForm.get('email')!.markAsTouched();
      expect(component._getEmailError()).toBeNull();
    });

    it('devuelve la clave de required cuando está tocado y vacío', () => {
      component.registerForm.get('email')!.markAsTouched();
      component.registerForm.get('email')!.setValue('');
      expect(component._getEmailError()).toBe('auth.register.emailRequired');
    });

    it('devuelve la clave de email inválido cuando el email está mal formado', () => {
      component.registerForm.get('email')!.markAsTouched();
      component.registerForm.get('email')!.setValue('no-es-email');
      expect(component._getEmailError()).toBe('auth.register.emailInvalid');
    });
  });

  describe('_getPasswordError', () => {
    it('devuelve null cuando el campo no ha sido tocado', () => {
      expect(component._getPasswordError()).toBeNull();
    });

    it('devuelve null cuando el campo es válido y está tocado', () => {
      component.registerForm.get('password')!.setValue('pass123');
      component.registerForm.get('password')!.markAsTouched();
      expect(component._getPasswordError()).toBeNull();
    });

    it('devuelve la clave de required cuando está tocado y vacío', () => {
      component.registerForm.get('password')!.markAsTouched();
      component.registerForm.get('password')!.setValue('');
      expect(component._getPasswordError()).toBe('auth.register.passwordRequired');
    });

    it('devuelve la clave de minlength cuando la contraseña es corta', () => {
      component.registerForm.get('password')!.markAsTouched();
      component.registerForm.get('password')!.setValue('abc');
      expect(component._getPasswordError()).toBe('auth.register.passwordMinLength');
    });
  });

  describe('_getConfirmPasswordError', () => {
    it('devuelve null cuando el campo no ha sido tocado', () => {
      expect(component._getConfirmPasswordError()).toBeNull();
    });

    it('devuelve null cuando confirmPassword coincide con password y está tocado', () => {
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });
      component.registerForm.get('confirmPassword')!.markAsTouched();
      expect(component._getConfirmPasswordError()).toBeNull();
    });

    it('devuelve la clave de required cuando está tocado y vacío', () => {
      component.registerForm.get('confirmPassword')!.markAsTouched();
      component.registerForm.get('confirmPassword')!.setValue('');
      expect(component._getConfirmPasswordError()).toBe('auth.register.confirmPasswordRequired');
    });

    it('devuelve la clave de passwordMismatch cuando las contraseñas no coinciden', () => {
      component.registerForm.setValue({
        displayName: 'Alice',
        email: 'a@b.com',
        password: 'pass123',
        confirmPassword: 'diferente'
      });
      component.registerForm.get('confirmPassword')!.markAsTouched();
      expect(component._getConfirmPasswordError()).toBe('auth.register.passwordMismatch');
    });
  });
});
