import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { firstValueFrom, Observable } from 'rxjs';

import { AuthStateService } from '@/services/auth-state.service';
import { canActivateUser } from './user.guard';

const mockRouter = { navigateByUrl: vi.fn(), navigate: vi.fn() };

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

    const result = TestBed.runInInjectionContext(() => canActivateUser({} as never, { url: '/games' } as never));

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('devuelve false y redirige a /auth/login con returnUrl cuando no está autenticado', () => {
    vi.mocked(mockAuthState.isAuthenticated!).mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => canActivateUser({} as never, { url: '/orders/123' } as never));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/orders/123' }
    });
  });

  function setupDeferredGuard(
    authenticated: boolean,
    url: string
  ): { loadingSignal: ReturnType<typeof signal<boolean>>; promise: Promise<boolean> } {
    const loadingSignal = signal<boolean>(true);
    const deferredAuthState: Partial<AuthStateService> = {
      loading: loadingSignal.asReadonly(),
      isAuthenticated: vi.fn().mockReturnValue(authenticated)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: deferredAuthState },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateUser({} as never, { url } as never));
    const promise = firstValueFrom(result as Observable<boolean>);
    return { loadingSignal, promise };
  }

  it('devuelve Observable que resuelve true cuando loading cambia a false y usuario está autenticado', async () => {
    const { loadingSignal, promise } = setupDeferredGuard(true, '/games');
    loadingSignal.set(false);
    TestBed.tick();
    expect(await promise).toBe(true);
  });

  it('devuelve Observable que resuelve false cuando loading cambia a false y usuario no está autenticado', async () => {
    const { loadingSignal, promise } = setupDeferredGuard(false, '/orders/123');
    loadingSignal.set(false);
    TestBed.tick();
    expect(await promise).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/orders/123' }
    });
  });
});
