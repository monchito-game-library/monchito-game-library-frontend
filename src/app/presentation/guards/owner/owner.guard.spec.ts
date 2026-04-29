import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { computed, signal } from '@angular/core';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { firstValueFrom, Observable } from 'rxjs';

import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';
import { canActivateOwner } from './owner.guard';
import { mockRouter } from '@/testing/router.mock';

function buildMockPreferences(role: 'admin' | 'member' | 'owner', loaded: boolean): Partial<UserPreferencesService> {
  const roleSignal = signal<'admin' | 'member' | 'owner'>(role);
  return {
    preferencesLoaded: signal(loaded),
    isOwner: computed(() => roleSignal() === 'owner')
  };
}

describe('canActivateOwner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve true cuando las preferencias están cargadas y el usuario es owner', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserPreferencesService, useValue: buildMockPreferences('owner', true) },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateOwner({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('devuelve false y redirige a /management cuando el usuario es admin (no owner)', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserPreferencesService, useValue: buildMockPreferences('admin', true) },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateOwner({} as never, {} as never));

    expect(result).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/management');
  });

  it('devuelve false y redirige cuando el usuario es member', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserPreferencesService, useValue: buildMockPreferences('member', true) },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateOwner({} as never, {} as never));

    expect(result).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/management');
  });

  function setupObservableGuard(role: 'admin' | 'member' | 'owner'): {
    loadedSignal: ReturnType<typeof signal<boolean>>;
    promise: Promise<boolean>;
  } {
    const loadedSignal = signal<boolean>(false);
    const roleSignal = signal<'admin' | 'member' | 'owner'>(role);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserPreferencesService,
          useValue: {
            preferencesLoaded: loadedSignal.asReadonly(),
            isOwner: computed(() => roleSignal() === 'owner')
          }
        },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const result = TestBed.runInInjectionContext(() => canActivateOwner({} as never, {} as never));
    const promise = firstValueFrom(result as Observable<boolean>);
    return { loadedSignal, promise };
  }

  it('resuelve true cuando preferencesLoaded cambia y el usuario es owner', async () => {
    const { loadedSignal, promise } = setupObservableGuard('owner');
    loadedSignal.set(true);
    TestBed.tick();
    expect(await promise).toBe(true);
  });

  it('resuelve false y redirige cuando preferencesLoaded cambia y no es owner', async () => {
    const { loadedSignal, promise } = setupObservableGuard('admin');
    loadedSignal.set(true);
    TestBed.tick();
    expect(await promise).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/management');
  });
});
