import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AUTH_USE_CASES } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { authBaseImports, authBaseProviders, authBaseSchemas } from '../../auth-spec.helpers';
import { RegisterComponent } from './register.component';
import { mockRouter } from '@/testing/router.mock';

const mockAuthUseCases = { signUp: vi.fn() };

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

      expect(mockAuthUseCases.signUp).toHaveBeenCalledWith('a@b.com', 'pass123', 'Alice');
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
});
