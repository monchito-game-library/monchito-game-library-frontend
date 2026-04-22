import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { authBaseImports, authBaseProviders, authBaseSchemas } from '@/pages/auth/auth-spec.helpers';
import { AuthBaseComponent, PasswordMismatchErrorStateMatcher } from './auth-base.component';
import { mockRouter } from '@/testing/router.mock';

@Component({ selector: 'app-test-auth', template: '', standalone: true })
class TestAuthComponent extends AuthBaseComponent {}

describe('AuthBaseComponent', () => {
  let component: TestAuthComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TestAuthComponent, ...authBaseImports],
      providers: [{ provide: Router, useValue: mockRouter }, ...authBaseProviders],
      schemas: authBaseSchemas
    });
    component = TestBed.createComponent(TestAuthComponent).componentInstance;
  });

  describe('señales iniciales', () => {
    it('loading empieza en false', () => {
      expect(component.loading()).toBe(false);
    });

    it('errorMessage empieza vacío', () => {
      expect(component.errorMessage()).toBe('');
    });

    it('successMessage empieza vacío', () => {
      expect(component.successMessage()).toBe('');
    });

    it('hidePassword empieza en true', () => {
      expect(component.hidePassword()).toBe(true);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('alterna hidePassword de true a false', () => {
      component.togglePasswordVisibility();
      expect(component.hidePassword()).toBe(false);
    });

    it('alterna hidePassword de vuelta a true', () => {
      component.togglePasswordVisibility();
      component.togglePasswordVisibility();
      expect(component.hidePassword()).toBe(true);
    });
  });

  describe('_setError', () => {
    it('usa el error del resultado si está disponible', () => {
      (component as any)._setError('Error del servidor', 'auth.fallback');
      expect(component.errorMessage()).toBe('Error del servidor');
    });

    it('usa la clave de traducción como fallback cuando no hay error', () => {
      (component as any)._setError(undefined, 'auth.login.loginFailed');
      expect(component.errorMessage()).toBe('auth.login.loginFailed');
    });
  });

  describe('_setSuccess', () => {
    it('establece successMessage con la clave de traducción', () => {
      (component as any)._setSuccess('auth.register.successMessage');
      expect(component.successMessage()).toBe('auth.register.successMessage');
    });
  });

  describe('_scheduleNavigation', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('no navega antes de que transcurra el tiempo indicado', () => {
      (component as any)._scheduleNavigation(['/auth/login'], 3000);
      vi.advanceTimersByTime(2999);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('navega a la ruta indicada tras el tiempo indicado', () => {
      (component as any)._scheduleNavigation(['/auth/login'], 3000);
      vi.advanceTimersByTime(3000);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('_passwordMatchValidator', () => {
    it('devuelve null cuando no existe el campo password', () => {
      const group = new FormGroup({ confirmPassword: new FormControl('pass123') });
      const result = (component as any)._passwordMatchValidator(group);
      expect(result).toBeNull();
    });

    it('devuelve null cuando no existe el campo confirmPassword', () => {
      const group = new FormGroup({ password: new FormControl('pass123') });
      const result = (component as any)._passwordMatchValidator(group);
      expect(result).toBeNull();
    });

    it('devuelve null cuando las contraseñas coinciden', () => {
      const group = new FormGroup({
        password: new FormControl('pass123'),
        confirmPassword: new FormControl('pass123')
      });
      const result = (component as any)._passwordMatchValidator(group);
      expect(result).toBeNull();
    });

    it('devuelve { passwordMismatch: true } cuando las contraseñas no coinciden', () => {
      const group = new FormGroup({
        password: new FormControl('pass123'),
        confirmPassword: new FormControl('different')
      });
      const result = (component as any)._passwordMatchValidator(group);
      expect(result).toEqual({ passwordMismatch: true });
    });
  });

  describe('passwordMismatchMatcher expuesto', () => {
    it('es una instancia de PasswordMismatchErrorStateMatcher', () => {
      expect(component.passwordMismatchMatcher).toBeInstanceOf(PasswordMismatchErrorStateMatcher);
    });
  });
});

describe('PasswordMismatchErrorStateMatcher', () => {
  let matcher: PasswordMismatchErrorStateMatcher;

  beforeEach(() => {
    matcher = new PasswordMismatchErrorStateMatcher();
  });

  it('devuelve false cuando el control es null', () => {
    expect(matcher.isErrorState(null, null)).toBe(false);
  });

  it('devuelve false cuando el control es válido y no está touched', () => {
    const control = new FormControl('abc');
    expect(matcher.isErrorState(control, null)).toBe(false);
  });

  it('devuelve false cuando el control es inválido pero no está touched', () => {
    const control = new FormControl('', { validators: [] });
    control.setErrors({ required: true });
    expect(matcher.isErrorState(control, null)).toBe(false);
  });

  it('devuelve true cuando el control es inválido y está touched', () => {
    const control = new FormControl('');
    control.setErrors({ required: true });
    control.markAsTouched();
    expect(matcher.isErrorState(control, null)).toBe(true);
  });

  it('devuelve false cuando el grupo padre tiene passwordMismatch pero el control no está touched', () => {
    const group = new FormGroup({ confirmPassword: new FormControl('abc') });
    group.setErrors({ passwordMismatch: true });
    const control = group.get('confirmPassword') as FormControl;
    expect(matcher.isErrorState(control, null)).toBe(false);
  });

  it('devuelve true cuando el grupo padre tiene passwordMismatch y el control está touched', () => {
    const group = new FormGroup({ confirmPassword: new FormControl('abc') });
    group.setErrors({ passwordMismatch: true });
    const control = group.get('confirmPassword') as FormControl;
    control.markAsTouched();
    expect(matcher.isErrorState(control, null)).toBe(true);
  });

  it('devuelve false cuando el grupo padre no tiene errores y el control es válido y touched', () => {
    const group = new FormGroup({ confirmPassword: new FormControl('abc') });
    const control = group.get('confirmPassword') as FormControl;
    control.markAsTouched();
    expect(matcher.isErrorState(control, null)).toBe(false);
  });
});
