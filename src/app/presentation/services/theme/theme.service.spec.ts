import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { describe, afterEach, expect, it, vi } from 'vitest';

import { THEME_STORAGE_KEY } from '@/constants/theme.constant';
import { ThemeType } from '@/types/theme.type';

import { ThemeService } from './theme.service';

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

interface MockMediaQueryList extends MediaQueryList {
  _fireChange: (newMatches: boolean) => void;
}

interface MockClassList {
  add: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  contains: (cls: string) => boolean;
}

interface MockDocument extends Document {
  documentElement: HTMLElement & { classList: MockClassList };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Crea un MediaQueryList simulado capaz de disparar eventos `change`. */
function createMockMql(matches: boolean): MockMediaQueryList {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();

  const addSpy = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
    if (type === 'change') {
      listeners.add(listener as (e: MediaQueryListEvent) => void);
    }
  });

  const removeSpy = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
    if (type === 'change') {
      listeners.delete(listener as (e: MediaQueryListEvent) => void);
    }
  });

  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
    addEventListener: addSpy,
    removeEventListener: removeSpy,
    _fireChange(newMatches: boolean): void {
      const event = {
        matches: newMatches,
        media: '(prefers-color-scheme: dark)'
      } as MediaQueryListEvent;
      listeners.forEach((l) => l(event));
    }
  } as unknown as MockMediaQueryList;
}

/** Crea un Document simulado con classList trackable en documentElement. */
function createMockDoc(): MockDocument {
  const classSet = new Set<string>();
  const classList: MockClassList = {
    add: vi.fn((cls: string) => {
      classSet.add(cls);
    }),
    remove: vi.fn((cls: string) => {
      classSet.delete(cls);
    }),
    contains: (cls: string): boolean => classSet.has(cls)
  };

  return {
    documentElement: { classList }
  } as unknown as MockDocument;
}

/** Stub de localStorage en memoria. */
function createLocalStorageStub(storedTheme: ThemeType | null): {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
} {
  const store = new Map<string, string>(storedTheme ? [[THEME_STORAGE_KEY, storedTheme]] : []);
  return {
    getItem: vi.fn((key: string): string | null => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string): void => {
      store.set(key, value);
    })
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ThemeService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Crea el servicio con doc y matchMedia simulados.
   * Hace stub de localStorage ANTES de que se instancie el servicio.
   */
  function buildService(
    storedTheme: ThemeType | null,
    prefersDark: boolean
  ): {
    service: ThemeService;
    mockDoc: MockDocument;
    mockMql: MockMediaQueryList;
    lsStub: ReturnType<typeof createLocalStorageStub>;
  } {
    const mockDoc = createMockDoc();
    const mockMql = createMockMql(prefersDark);
    const lsStub = createLocalStorageStub(storedTheme);

    // Stub de localStorage (global en el service)
    vi.spyOn(globalThis, 'localStorage', 'get').mockReturnValue(lsStub as unknown as Storage);

    // mockDoc.defaultView expone matchMedia simulado
    Object.defineProperty(mockDoc, 'defaultView', {
      configurable: true,
      get: () => ({ matchMedia: (_q: string): MediaQueryList => mockMql })
    });

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: DOCUMENT, useValue: mockDoc }]
    });

    const service = TestBed.inject(ThemeService);
    return { service, mockDoc, mockMql, lsStub };
  }

  // ─── 1. Sin localStorage + matchMedia dark ─────────────────────────────────

  describe('inicialización sin preferencia guardada — SO dark', () => {
    it('theme() es dark', () => {
      const { service } = buildService(null, true);

      expect(service.theme()).toBe<ThemeType>('dark');
    });

    it('documentElement tiene clase theme-dark', () => {
      const { mockDoc } = buildService(null, true);

      expect(mockDoc.documentElement.classList.contains('theme-dark')).toBe(true);
    });

    it('documentElement NO tiene clase theme-light', () => {
      const { mockDoc } = buildService(null, true);

      expect(mockDoc.documentElement.classList.contains('theme-light')).toBe(false);
    });
  });

  // ─── 2. Sin localStorage + matchMedia light ────────────────────────────────

  describe('inicialización sin preferencia guardada — SO light', () => {
    it('theme() es light', () => {
      const { service } = buildService(null, false);

      expect(service.theme()).toBe<ThemeType>('light');
    });

    it('documentElement tiene clase theme-light', () => {
      const { mockDoc } = buildService(null, false);

      expect(mockDoc.documentElement.classList.contains('theme-light')).toBe(true);
    });

    it('documentElement NO tiene clase theme-dark', () => {
      const { mockDoc } = buildService(null, false);

      expect(mockDoc.documentElement.classList.contains('theme-dark')).toBe(false);
    });
  });

  // ─── 3. localStorage === 'light' ──────────────────────────────────────────

  describe('inicialización con localStorage light', () => {
    it('theme() es light', () => {
      const { service } = buildService('light', true);

      expect(service.theme()).toBe<ThemeType>('light');
    });

    it('documentElement tiene clase theme-light', () => {
      const { mockDoc } = buildService('light', true);

      expect(mockDoc.documentElement.classList.contains('theme-light')).toBe(true);
    });

    it('NO se registra listener en matchMedia', () => {
      const { mockMql } = buildService('light', true);

      expect(mockMql.addEventListener).not.toHaveBeenCalled();
    });
  });

  // ─── 4. localStorage === 'dark' ───────────────────────────────────────────

  describe('inicialización con localStorage dark', () => {
    it('theme() es dark', () => {
      const { service } = buildService('dark', false);

      expect(service.theme()).toBe<ThemeType>('dark');
    });

    it('documentElement tiene clase theme-dark', () => {
      const { mockDoc } = buildService('dark', false);

      expect(mockDoc.documentElement.classList.contains('theme-dark')).toBe(true);
    });

    it('NO se registra listener en matchMedia', () => {
      const { mockMql } = buildService('dark', false);

      expect(mockMql.addEventListener).not.toHaveBeenCalled();
    });
  });

  // ─── 5. setTheme() ────────────────────────────────────────────────────────

  describe('setTheme()', () => {
    it('setTheme(light) actualiza theme() a light', () => {
      const { service } = buildService(null, true);

      service.setTheme('light');

      expect(service.theme()).toBe<ThemeType>('light');
    });

    it('setTheme(light) persiste el valor en localStorage', () => {
      const { service, lsStub } = buildService(null, true);

      service.setTheme('light');

      expect(lsStub.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'light');
    });

    it('setTheme(light) aplica clase theme-light y elimina theme-dark', () => {
      const { service, mockDoc } = buildService(null, true);

      service.setTheme('light');

      expect(mockDoc.documentElement.classList.contains('theme-light')).toBe(true);
      expect(mockDoc.documentElement.classList.contains('theme-dark')).toBe(false);
    });

    it('setTheme(dark) aplica clase theme-dark y elimina theme-light', () => {
      const { service, mockDoc } = buildService(null, false);

      service.setTheme('dark');

      expect(mockDoc.documentElement.classList.contains('theme-dark')).toBe(true);
      expect(mockDoc.documentElement.classList.contains('theme-light')).toBe(false);
    });

    it('setTheme() desuscribe el listener de matchMedia', () => {
      const { service, mockMql } = buildService(null, false);

      // El listener se añadió durante la inicialización (sin localStorage)
      expect(mockMql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      service.setTheme('dark');

      expect(mockMql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  // ─── 6. toggleTheme() ─────────────────────────────────────────────────────

  describe('toggleTheme()', () => {
    it('alterna de dark a light', () => {
      const { service } = buildService(null, true);

      expect(service.theme()).toBe<ThemeType>('dark');

      service.toggleTheme();

      expect(service.theme()).toBe<ThemeType>('light');
    });

    it('alterna de light a dark', () => {
      const { service } = buildService(null, false);

      expect(service.theme()).toBe<ThemeType>('light');

      service.toggleTheme();

      expect(service.theme()).toBe<ThemeType>('dark');
    });

    it('alterna dark → light → dark en sucesivos calls', () => {
      const { service } = buildService(null, true);

      expect(service.theme()).toBe<ThemeType>('dark');

      service.toggleTheme();
      expect(service.theme()).toBe<ThemeType>('light');

      service.toggleTheme();
      expect(service.theme()).toBe<ThemeType>('dark');
    });
  });

  // ─── 7. Cambio de matchMedia sin tema fijado ───────────────────────────────

  describe('reacción a cambios del SO sin preferencia guardada', () => {
    it('cambia theme() a dark cuando matchMedia dispara matches=true', () => {
      const { service, mockMql } = buildService(null, false);

      expect(service.theme()).toBe<ThemeType>('light');

      mockMql._fireChange(true);

      expect(service.theme()).toBe<ThemeType>('dark');
    });

    it('cambia theme() a light cuando matchMedia dispara matches=false', () => {
      const { service, mockMql } = buildService(null, true);

      expect(service.theme()).toBe<ThemeType>('dark');

      mockMql._fireChange(false);

      expect(service.theme()).toBe<ThemeType>('light');
    });

    it('aplica clase correcta al documentElement al cambiar el SO', () => {
      const { mockDoc, mockMql } = buildService(null, false);

      mockMql._fireChange(true);

      expect(mockDoc.documentElement.classList.contains('theme-dark')).toBe(true);
      expect(mockDoc.documentElement.classList.contains('theme-light')).toBe(false);
    });
  });

  // ─── 8. Cambio de matchMedia con tema fijado explícitamente ───────────────

  describe('cambio de matchMedia ignorado tras fijar tema explícito', () => {
    it('un cambio posterior de matchMedia NO modifica theme() si el usuario fijó el tema', () => {
      const { service, mockMql } = buildService(null, false);

      expect(service.theme()).toBe<ThemeType>('light');

      service.setTheme('light');

      // Simulamos que el SO cambia a dark
      mockMql._fireChange(true);

      // El tema no debe haberse alterado porque el listener fue desuscrito
      expect(service.theme()).toBe<ThemeType>('light');
    });

    it('un cambio posterior de matchMedia no modifica las clases si el usuario fijó el tema', () => {
      const { service, mockDoc, mockMql } = buildService(null, false);

      service.setTheme('light');

      mockMql._fireChange(true);

      expect(mockDoc.documentElement.classList.contains('theme-light')).toBe(true);
      expect(mockDoc.documentElement.classList.contains('theme-dark')).toBe(false);
    });

    it('con tema de localStorage, el listener no está suscrito, así que _fireChange no tiene efecto', () => {
      const { service, mockMql } = buildService('light', true);

      // El listener nunca se suscribió; _fireChange no tiene a quién llamar
      mockMql._fireChange(true);

      expect(service.theme()).toBe<ThemeType>('light');
    });
  });
});
