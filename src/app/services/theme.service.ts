import { effect, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _renderer: Renderer2;
  private readonly _themeKey = 'user-theme';

  /** Señal interna para representar el modo oscuro/claro */
  private readonly _isDark = signal<boolean>(true);

  /** Exposición pública y reactiva del estado del tema */
  readonly isDarkMode = this._isDark.asReadonly();

  constructor(rendererFactory: RendererFactory2) {
    this._renderer = rendererFactory.createRenderer(null, null);

    // Reactividad: aplica la clase al documento automáticamente cuando cambia el tema
    effect(() => {
      const isDark = this._isDark();

      if (isDark) {
        this._renderer.addClass(document.documentElement, 'dark-mode');
        localStorage.setItem(this._themeKey, 'dark');
      } else {
        this._renderer.removeClass(document.documentElement, 'dark-mode');
        localStorage.setItem(this._themeKey, 'light');
      }
    });
  }

  /** Inicializa el tema desde localStorage o preferencia del sistema */
  initTheme(): void {
    const saved = localStorage.getItem(this._themeKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this._isDark.set(saved === 'dark' || (!saved && prefersDark));
  }

  /** Alterna entre tema claro y oscuro */
  toggleTheme(): void {
    this._isDark.update((prev) => !prev);
  }

  /** Fuerza modo oscuro */
  setDarkTheme(): void {
    this._isDark.set(true);
  }

  /** Fuerza modo claro */
  setLightTheme(): void {
    this._isDark.set(false);
  }
}
