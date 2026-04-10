import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { canActivateDesktopOnly } from './desktop-only.guard';

const mockRouter = { navigateByUrl: vi.fn() };

function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

describe('canActivateDesktopOnly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: mockRouter }]
    });
  });

  afterEach(() => {
    // Restore to a safe default so other specs aren't affected.
    setViewportWidth(1024);
  });

  it('devuelve true cuando el ancho de pantalla es igual al mínimo (768px)', () => {
    setViewportWidth(768);

    const result = TestBed.runInInjectionContext(() => canActivateDesktopOnly({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('devuelve true cuando el ancho de pantalla es mayor que el mínimo', () => {
    setViewportWidth(1920);

    const result = TestBed.runInInjectionContext(() => canActivateDesktopOnly({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('devuelve false y redirige a /games cuando el ancho es menor que el mínimo', () => {
    setViewportWidth(767);

    const result = TestBed.runInInjectionContext(() => canActivateDesktopOnly({} as never, {} as never));

    expect(result).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/games');
  });

  it('devuelve false y redirige a /games en pantallas muy pequeñas (320px)', () => {
    setViewportWidth(320);

    const result = TestBed.runInInjectionContext(() => canActivateDesktopOnly({} as never, {} as never));

    expect(result).toBe(false);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/games');
  });
});
