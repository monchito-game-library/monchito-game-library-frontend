import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { firstValueFrom, Observable } from 'rxjs';

import { AuthStateService } from '@/services/auth-state.service';
import { canActivateUser } from './user.guard';

const mockRouter = { navigateByUrl: vi.fn() };

describe('canActivateUser', () => {
  let mockAuthState: Partial<AuthStateService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthState = {
      loading: signal(false),
      isAuthenticated: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: mockAuthState },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('devuelve true cuando el usuario está autenticado y loading es false', () => {
    vi.mocked(mockAuthState.isAuthenticated!).mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => canActivateUser({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('devuelve false y redirige a /auth/login cuando no está autenticado', () => {
    vi.mocked(mockAuthState.isAuthenticated!).mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => canActivateUser({} as never, {} as never));

    expect(result).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('devuelve Observable que resuelve true cuando loading cambia a false y usuario está autenticado', async () => {
    const loadingSignal = signal<boolean>(true);
    const deferredAuthState: Partial<AuthStateService> = {
      loading: loadingSignal.asReadonly(),
      isAuthenticated: vi.fn().mockReturnValue(true)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: deferredAuthState },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateUser({} as never, {} as never));
    const promise = firstValueFrom(result as Observable<boolean>);

    loadingSignal.set(false);
    TestBed.flushEffects();

    expect(await promise).toBe(true);
  });

  it('devuelve Observable que resuelve false cuando loading cambia a false y usuario no está autenticado', async () => {
    const loadingSignal = signal<boolean>(true);
    const deferredAuthState: Partial<AuthStateService> = {
      loading: loadingSignal.asReadonly(),
      isAuthenticated: vi.fn().mockReturnValue(false)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: deferredAuthState },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateUser({} as never, {} as never));
    const promise = firstValueFrom(result as Observable<boolean>);

    loadingSignal.set(false);
    TestBed.flushEffects();

    expect(await promise).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });
});
