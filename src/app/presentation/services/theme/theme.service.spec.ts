import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ providers: [ThemeService] });
    service = TestBed.inject(ThemeService);
  });

  it('setDarkTheme expone isDarkMode como true', () => {
    service.setLightTheme();
    service.setDarkTheme();

    expect(service.isDarkMode()).toBe(true);
  });

  it('setLightTheme expone isDarkMode como false', () => {
    service.setLightTheme();

    expect(service.isDarkMode()).toBe(false);
  });

  it('el estado inicial de isDarkMode es true', () => {
    expect(service.isDarkMode()).toBe(true);
  });

  it('initTheme detecta preferencia dark y activa isDarkMode', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);

    service.initTheme();

    expect(service.isDarkMode()).toBe(true);
  });

  it('initTheme detecta preferencia light y desactiva isDarkMode', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);

    service.initTheme();

    expect(service.isDarkMode()).toBe(false);
  });

  it('setDarkTheme y setLightTheme alternan el estado correctamente', () => {
    service.setLightTheme();
    expect(service.isDarkMode()).toBe(false);

    service.setDarkTheme();
    expect(service.isDarkMode()).toBe(true);

    service.setLightTheme();
    expect(service.isDarkMode()).toBe(false);
  });

  it('el effect añade la clase dark-mode al documentElement cuando isDark es true', () => {
    service.setDarkTheme();
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('el effect elimina la clase dark-mode del documentElement cuando isDark es false', () => {
    service.setDarkTheme();
    TestBed.flushEffects();
    service.setLightTheme();
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });
});
