import { effect, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';

/** Presentation service that manages the dark/light theme. The preference is persisted in Supabase; system color-scheme is used as the initial default. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _renderer: Renderer2;

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
      } else {
        this._renderer.removeClass(document.documentElement, 'dark-mode');
      }
    });
  }

  /** Initializes the theme from the system color-scheme preference. Supabase will override this once user preferences are loaded. */
  initTheme(): void {
    localStorage.removeItem('user-theme');
    const prefersDark: boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._isDark.set(prefersDark);
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
