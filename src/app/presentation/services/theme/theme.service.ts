import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { THEME_STORAGE_KEY } from '@/constants/theme.constant';
import { ThemeType } from '@/types/theme.type';

/**
 * Servicio que gestiona el tema visual de la aplicación (light/dark).
 *
 * - Lee la preferencia del usuario desde localStorage al arrancar.
 * - Si no hay preferencia guardada, escucha `prefers-color-scheme` del SO.
 * - Aplica las clases `theme-light` / `theme-dark` en `document.documentElement`.
 * - Al llamar a `setTheme()`, desuscribe el listener del SO y persiste la elección.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  // ─── Inyecciones privadas ────────────────────────────────────────────────────

  private readonly _document: Document = inject(DOCUMENT);

  // ─── Variables privadas ──────────────────────────────────────────────────────

  /** Signal interno mutable del tema actual. */
  private readonly _theme: WritableSignal<ThemeType> = signal<ThemeType>('dark');

  /** MediaQueryList activo para escuchar cambios del SO, o null si no aplica. */
  private _mediaQuery: MediaQueryList | null = null;

  /** Referencia al listener de matchMedia para poder desuscribirlo. */
  private _mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

  // ─── Signals públicos ────────────────────────────────────────────────────────

  /** Signal de solo lectura con el tema actualmente activo (`'light'` | `'dark'`). */
  readonly theme: Signal<ThemeType> = this._theme.asReadonly();

  // ─── Constructor ─────────────────────────────────────────────────────────────

  constructor() {
    this._initialize();
  }

  // ─── Métodos públicos ────────────────────────────────────────────────────────

  /**
   * Fija el tema explícitamente, lo persiste en localStorage y desuscribe
   * el listener de matchMedia si estaba activo.
   *
   * @param {ThemeType} theme - Tema a aplicar: `'light'` o `'dark'`
   */
  setTheme(theme: ThemeType): void {
    this._detachMediaQueryListener();
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this._applyTheme(theme);
  }

  /**
   * Alterna entre `'light'` y `'dark'`.
   * Equivalente a llamar a `setTheme()` con el valor opuesto al actual.
   */
  toggleTheme(): void {
    const next: ThemeType = this._theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  // ─── Métodos privados ────────────────────────────────────────────────────────

  /**
   * Inicializa el tema al arrancar el servicio.
   *
   * 1. Lee `localStorage` — si hay valor válido, lo aplica sin registrar listener.
   * 2. Si no hay valor, lee `prefers-color-scheme` y registra listener para
   *    reaccionar a futuros cambios del SO mientras el usuario no haya elegido.
   */
  private _initialize(): void {
    const stored: string | null = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
      this._applyTheme(stored);
      return;
    }

    const mq: MediaQueryList | null = this._getPrefersDarkMediaQuery();
    const prefersDark: boolean = mq?.matches ?? false;
    this._applyTheme(prefersDark ? 'dark' : 'light');

    if (mq) {
      this._attachMediaQueryListener(mq);
    }
  }

  /**
   * Aplica el tema dado añadiendo la clase correspondiente a `document.documentElement`
   * y eliminando la contraria. Actualiza el signal interno.
   *
   * @param {ThemeType} theme - Tema a aplicar
   */
  private _applyTheme(theme: ThemeType): void {
    const root: HTMLElement = this._document.documentElement;
    const add: string = `theme-${theme}`;
    const remove: string = theme === 'dark' ? 'theme-light' : 'theme-dark';

    root.classList.add(add);
    root.classList.remove(remove);
    this._theme.set(theme);
  }

  /**
   * Devuelve el `MediaQueryList` para `(prefers-color-scheme: dark)`,
   * o `null` si `window` no está disponible (SSR / entornos sin DOM).
   */
  private _getPrefersDarkMediaQuery(): MediaQueryList | null {
    const win: (Window & typeof globalThis) | null = this._document.defaultView ?? null;

    if (!win) {
      return null;
    }

    return win.matchMedia('(prefers-color-scheme: dark)');
  }

  /**
   * Registra un listener en el `MediaQueryList` proporcionado para reaccionar
   * a cambios del esquema de color del SO.
   *
   * @param {MediaQueryList} mq - MediaQueryList al que suscribirse
   */
  private _attachMediaQueryListener(mq: MediaQueryList): void {
    this._mediaQuery = mq;
    this._mediaQueryListener = (e: MediaQueryListEvent): void => {
      this._applyTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', this._mediaQueryListener);
  }

  /**
   * Elimina el listener de matchMedia si estaba activo y limpia las referencias.
   */
  private _detachMediaQueryListener(): void {
    if (this._mediaQuery && this._mediaQueryListener) {
      this._mediaQuery.removeEventListener('change', this._mediaQueryListener);
    }
    this._mediaQuery = null;
    this._mediaQueryListener = null;
  }
}
