import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { computed, signal } from '@angular/core';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { firstValueFrom, Observable } from 'rxjs';

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

  it('devuelve false y redirige a /games cuando las preferencias están cargadas y el usuario no es admin', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserPreferencesService, useValue: buildMockPreferences(false, true) },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateAdmin({} as never, {} as never));

    expect(result).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/collection');
  });

  function setupObservableGuard(role: 'admin' | 'user'): {
    loadedSignal: ReturnType<typeof signal<boolean>>;
    promise: Promise<boolean>;
  } {
    const loadedSignal = signal<boolean>(false);
    const roleSignal = signal<'admin' | 'user'>(role);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserPreferencesService,
          useValue: { preferencesLoaded: loadedSignal.asReadonly(), isAdmin: computed(() => roleSignal() === 'admin') }
        },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateAdmin({} as never, {} as never));
    const promise = firstValueFrom(result as Observable<boolean>);
    return { loadedSignal, promise };
  }

  it('devuelve Observable que resuelve true cuando preferencesLoaded cambia y el usuario es admin', async () => {
    const { loadedSignal, promise } = setupObservableGuard('admin');
    loadedSignal.set(true);
    TestBed.tick();
    expect(await promise).toBe(true);
  });

  it('devuelve Observable que resuelve false y redirige cuando preferencesLoaded cambia y no es admin', async () => {
    const { loadedSignal, promise } = setupObservableGuard('user');
    loadedSignal.set(true);
    TestBed.tick();
    expect(await promise).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/collection');
  });
});
