import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { computed, signal } from '@angular/core';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { UserPreferencesService } from '@/services/user-preferences.service';
import { canActivateAdmin } from './admin.guard';

const mockRouter = { navigateByUrl: vi.fn() };

function buildMockPreferences(isAdmin: boolean, loaded: boolean): Partial<UserPreferencesService> {
  const role = signal<'admin' | 'user'>(isAdmin ? 'admin' : 'user');
  return {
    preferencesLoaded: signal(loaded),
    isAdmin: computed(() => role() === 'admin')
  };
}

describe('canActivateAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve true cuando las preferencias están cargadas y el usuario es admin', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserPreferencesService, useValue: buildMockPreferences(true, true) },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateAdmin({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('devuelve false y redirige a /list cuando las preferencias están cargadas y el usuario no es admin', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserPreferencesService, useValue: buildMockPreferences(false, true) },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateAdmin({} as never, {} as never));

    expect(result).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/list');
  });
});
