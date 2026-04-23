import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AuthStateService } from '@/services/auth-state/auth-state.service';
import { mockRouter } from '@/testing/router.mock';
import { canActivatePublic } from './public.guard';

const runGuard = () => TestBed.runInInjectionContext(() => canActivatePublic({} as any, {} as any));

describe('canActivatePublic', () => {
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

  it('permite el acceso cuando el usuario no está autenticado', () => {
    vi.mocked(mockAuthState.isAuthenticated!).mockReturnValue(false);

    const result = runGuard();

    expect(result).toBe(true);
  });

  it('redirige a /collection cuando el usuario ya está autenticado', () => {
    vi.mocked(mockAuthState.isAuthenticated!).mockReturnValue(true);

    const result = runGuard();

    expect(result).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/collection');
  });

  function setupDeferredGuard(authenticated: boolean): {
    loadingSignal: ReturnType<typeof signal<boolean>>;
    promise: Promise<boolean>;
  } {
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

    const result = TestBed.runInInjectionContext(() => canActivatePublic({} as any, {} as any));
    const promise = firstValueFrom(result as Observable<boolean>);
    return { loadingSignal, promise };
  }

  it('devuelve Observable que resuelve false cuando loading cambia a false y el usuario está autenticado', async () => {
    const { loadingSignal, promise } = setupDeferredGuard(true);
    loadingSignal.set(false);
    TestBed.tick();
    expect(await promise).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/collection');
  });

  it('devuelve Observable que resuelve true cuando loading cambia a false y el usuario no está autenticado', async () => {
    const { loadingSignal, promise } = setupDeferredGuard(false);
    loadingSignal.set(false);
    TestBed.tick();
    expect(await promise).toBe(true);
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });
});
