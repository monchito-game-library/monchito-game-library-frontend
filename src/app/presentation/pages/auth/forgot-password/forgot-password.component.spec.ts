import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AUTH_USE_CASES } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { ForgotPasswordComponent } from './forgot-password.component';

const mockAuthUseCases = { resetPassword: vi.fn() };
const mockRouter = { navigate: vi.fn() };

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [
        ForgotPasswordComponent,
        ReactiveFormsModule,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: AUTH_USE_CASES, useValue: mockAuthUseCases },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    component = TestBed.createComponent(ForgotPasswordComponent).componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('estado inicial', () => {
    it('loading empieza en false', () => {
      expect(component.loading()).toBe(false);
    });

    it('errorMessage empieza vacío', () => {
      expect(component.errorMessage()).toBe('');
    });

    it('successMessage empieza vacío', () => {
      expect(component.successMessage()).toBe('');
    });

    it('el formulario empieza inválido', () => {
      expect(component.forgotPasswordForm.invalid).toBe(true);
    });
  });

  describe('validación del formulario', () => {
    it('es inválido con campo email vacío', () => {
      component.forgotPasswordForm.setValue({ email: '' });
      expect(component.forgotPasswordForm.invalid).toBe(true);
    });

    it('es inválido con email mal formado', () => {
      component.forgotPasswordForm.setValue({ email: 'no-es-email' });
      expect(component.forgotPasswordForm.invalid).toBe(true);
    });

    it('es válido con un email correcto', () => {
      component.forgotPasswordForm.setValue({ email: 'user@example.com' });
      expect(component.forgotPasswordForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('no llama a resetPassword si el formulario es inválido', async () => {
      await component.onSubmit();
      expect(mockAuthUseCases.resetPassword).not.toHaveBeenCalled();
    });

    it('marca el formulario como touched si es inválido', async () => {
      await component.onSubmit();
      expect(component.forgotPasswordForm.touched).toBe(true);
    });

    it('llama a resetPassword con el email del formulario', async () => {
      mockAuthUseCases.resetPassword.mockResolvedValue({ success: true });
      component.forgotPasswordForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(mockAuthUseCases.resetPassword).toHaveBeenCalledWith('user@example.com');
    });

    it('establece successMessage tras enviar el email correctamente', async () => {
      mockAuthUseCases.resetPassword.mockResolvedValue({ success: true });
      component.forgotPasswordForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(component.successMessage()).toContain('Password reset email sent');
    });

    it('navega a /auth/login 3 segundos después del éxito', async () => {
      mockAuthUseCases.resetPassword.mockResolvedValue({ success: true });
      component.forgotPasswordForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      vi.advanceTimersByTime(3000);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('establece errorMessage cuando el envío falla', async () => {
      mockAuthUseCases.resetPassword.mockResolvedValue({ success: false, error: 'Email no encontrado' });
      component.forgotPasswordForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Email no encontrado');
      expect(component.successMessage()).toBe('');
    });

    it('usa "Failed to send reset email" como error por defecto', async () => {
      mockAuthUseCases.resetPassword.mockResolvedValue({ success: false });
      component.forgotPasswordForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Failed to send reset email');
    });

    it('loading vuelve a false tras completar', async () => {
      mockAuthUseCases.resetPassword.mockResolvedValue({ success: true });
      component.forgotPasswordForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(component.loading()).toBe(false);
    });
  });
});
