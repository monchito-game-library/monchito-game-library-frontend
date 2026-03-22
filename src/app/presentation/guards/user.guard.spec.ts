import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { describe, beforeEach, expect, it, vi } from 'vitest';

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
});
