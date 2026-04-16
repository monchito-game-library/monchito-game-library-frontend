import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AUTH_USE_CASES } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { authBaseImports, authBaseProviders, authBaseSchemas } from '../../auth-spec.helpers';
import { ResetPasswordComponent } from './reset-password.component';

const mockAuthUseCases = {
  onPasswordRecovery: vi.fn(),
  updatePassword: vi.fn(),
  signOut: vi.fn()
};
const mockRouter = { navigate: vi.fn() };

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ...authBaseImports],
      providers: [
        { provide: AUTH_USE_CASES, useValue: mockAuthUseCases },
        { provide: Router, useValue: mockRouter },
        ...authBaseProviders
      ],
      schemas: authBaseSchemas
    });
    component = TestBed.createComponent(ResetPasswordComponent).componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('estado inicial', () => {
    it('recoveryReady empieza en false', () => {
      expect(component.recoveryReady()).toBe(false);
    });

    it('hideConfirmPassword empieza en true', () => {
      expect(component.hideConfirmPassword()).toBe(true);
    });

    it('el formulario empieza inválido', () => {
      expect(component.resetPasswordForm.invalid).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('llama a onPasswordRecovery al inicializarse', () => {
      component.ngOnInit();
      expect(mockAuthUseCases.onPasswordRecovery).toHaveBeenCalledOnce();
    });

    it('el callback de onPasswordRecovery activa recoveryReady', () => {
      mockAuthUseCases.onPasswordRecovery.mockImplementation((cb: () => void) => cb());
      component.ngOnInit();
      expect(component.recoveryReady()).toBe(true);
    });
  });

  describe('toggleConfirmPasswordVisibility', () => {
    it('alterna hideConfirmPassword', () => {
      expect(component.hideConfirmPassword()).toBe(true);
      component.toggleConfirmPasswordVisibility();
      expect(component.hideConfirmPassword()).toBe(false);
      component.toggleConfirmPasswordVisibility();
      expect(component.hideConfirmPassword()).toBe(true);
    });
  });

  describe('validación del formulario', () => {
    it('es inválido con ambos campos vacíos', () => {
      component.resetPasswordForm.setValue({ password: '', confirmPassword: '' });
      expect(component.resetPasswordForm.invalid).toBe(true);
    });

    it('es inválido con contraseña de menos de 6 caracteres', () => {
      component.resetPasswordForm.setValue({ password: '12345', confirmPassword: '12345' });
      expect(component.resetPasswordForm.invalid).toBe(true);
    });

    it('es inválido cuando las contraseñas no coinciden', () => {
      component.resetPasswordForm.setValue({ password: '123456', confirmPassword: 'abcdef' });
      expect(component.resetPasswordForm.hasError('passwordMismatch')).toBe(true);
    });

    it('es válido cuando las contraseñas son iguales y tienen 6+ caracteres', () => {
      component.resetPasswordForm.setValue({ password: '123456', confirmPassword: '123456' });
      expect(component.resetPasswordForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('no llama a updatePassword si el formulario es inválido', async () => {
      await component.onSubmit();
      expect(mockAuthUseCases.updatePassword).not.toHaveBeenCalled();
    });

    it('marca el formulario como touched si es inválido', async () => {
      await component.onSubmit();
      expect(component.resetPasswordForm.touched).toBe(true);
    });

    it('llama a updatePassword con la nueva contraseña', async () => {
      mockAuthUseCases.updatePassword.mockResolvedValue({ success: true });
      mockAuthUseCases.signOut.mockResolvedValue(undefined);
      component.resetPasswordForm.setValue({ password: 'nueva1234', confirmPassword: 'nueva1234' });

      await component.onSubmit();

      expect(mockAuthUseCases.updatePassword).toHaveBeenCalledWith('nueva1234');
    });

    it('llama a signOut tras actualizar la contraseña correctamente', async () => {
      mockAuthUseCases.updatePassword.mockResolvedValue({ success: true });
      mockAuthUseCases.signOut.mockResolvedValue(undefined);
      component.resetPasswordForm.setValue({ password: 'nueva1234', confirmPassword: 'nueva1234' });

      await component.onSubmit();

      expect(mockAuthUseCases.signOut).toHaveBeenCalledOnce();
    });

    it('establece successMessage tras actualizar la contraseña correctamente', async () => {
      mockAuthUseCases.updatePassword.mockResolvedValue({ success: true });
      mockAuthUseCases.signOut.mockResolvedValue(undefined);
      component.resetPasswordForm.setValue({ password: 'nueva1234', confirmPassword: 'nueva1234' });

      await component.onSubmit();

      expect(component.successMessage()).toBe('auth.resetPassword.successMessage');
    });

    it('navega a /auth/login 2 segundos después del éxito', async () => {
      mockAuthUseCases.updatePassword.mockResolvedValue({ success: true });
      mockAuthUseCases.signOut.mockResolvedValue(undefined);
      component.resetPasswordForm.setValue({ password: 'nueva1234', confirmPassword: 'nueva1234' });

      await component.onSubmit();
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('establece errorMessage cuando la actualización falla', async () => {
      mockAuthUseCases.updatePassword.mockResolvedValue({ success: false, error: 'Token expirado' });
      component.resetPasswordForm.setValue({ password: 'nueva1234', confirmPassword: 'nueva1234' });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Token expirado');
      expect(component.successMessage()).toBe('');
    });

    it('usa la clave de traducción como error por defecto', async () => {
      mockAuthUseCases.updatePassword.mockResolvedValue({ success: false });
      component.resetPasswordForm.setValue({ password: 'nueva1234', confirmPassword: 'nueva1234' });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('auth.resetPassword.updateFailed');
    });

    it('loading vuelve a false tras completar', async () => {
      mockAuthUseCases.updatePassword.mockResolvedValue({ success: true });
      mockAuthUseCases.signOut.mockResolvedValue(undefined);
      component.resetPasswordForm.setValue({ password: 'nueva1234', confirmPassword: 'nueva1234' });

      await component.onSubmit();

      expect(component.loading()).toBe(false);
    });

    it('no llama a signOut si la actualización falla', async () => {
      mockAuthUseCases.updatePassword.mockResolvedValue({ success: false, error: 'Error' });
      component.resetPasswordForm.setValue({ password: 'nueva1234', confirmPassword: 'nueva1234' });

      await component.onSubmit();

      expect(mockAuthUseCases.signOut).not.toHaveBeenCalled();
    });
  });
});
