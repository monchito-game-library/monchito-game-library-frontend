import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
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
});
