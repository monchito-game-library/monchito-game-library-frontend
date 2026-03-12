import { effect, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';

/** Presentation service that manages the dark/light theme and persists the preference to localStorage. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _renderer: Renderer2;
  private readonly _themeKey = 'user-theme';

  /** Internal signal tracking whether dark mode is active. */
  private readonly _isDark = signal<boolean>(true);

  /** Public read-only signal exposing the current dark-mode state. */
  readonly isDarkMode = this._isDark.asReadonly();

  constructor(rendererFactory: RendererFactory2) {
    this._renderer = rendererFactory.createRenderer(null, null);

    effect(() => {
      const isDark: boolean = this._isDark();

      if (isDark) {
        this._renderer.addClass(document.documentElement, 'dark-mode');
        localStorage.setItem(this._themeKey, 'dark');
      } else {
        this._renderer.removeClass(document.documentElement, 'dark-mode');
        localStorage.setItem(this._themeKey, 'light');
      }
    });
  }

  /** Initialises the theme from localStorage, falling back to the system colour-scheme preference. */
  initTheme(): void {
    const saved: string | null = localStorage.getItem(this._themeKey);
    const prefersDark: boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this._isDark.set(saved === 'dark' || (!saved && prefersDark));
  }

  /** Forces dark mode. */
  setDarkTheme(): void {
    this._isDark.set(true);
  }

  /** Forces light mode. */
  setLightTheme(): void {
    this._isDark.set(false);
  }
}
