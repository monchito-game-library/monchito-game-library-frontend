import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { PwaUpdateService } from './pwa-update.service';

describe('PwaUpdateService', () => {
  let service: PwaUpdateService;
  let versionUpdates$: Subject<any>;
  let routerEvents$: Subject<any>;
  let checkForUpdateSpy: ReturnType<typeof vi.fn>;
  let activateUpdateSpy: ReturnType<typeof vi.fn>;
  let mockSwEnabled: boolean;
  let mockRouterUrl: string;
  let bodyChildrenBefore: number;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSwEnabled = true;
    mockRouterUrl = '/home';
    versionUpdates$ = new Subject();
    routerEvents$ = new Subject();
    checkForUpdateSpy = vi.fn().mockResolvedValue(false);
    // Never-resolving: si el timer de 400ms se dispara, activateUpdate no llega a llamar reload()
    activateUpdateSpy = vi.fn().mockReturnValue(new Promise(() => {}));
    bodyChildrenBefore = document.body.children.length;

    TestBed.configureTestingModule({
      providers: [
        PwaUpdateService,
        {
          provide: SwUpdate,
          useValue: {
            get isEnabled() {
              return mockSwEnabled;
            },
            versionUpdates: versionUpdates$.asObservable(),
            checkForUpdate: checkForUpdateSpy,
            activateUpdate: activateUpdateSpy
          }
        },
        {
          provide: Router,
          useValue: {
            get url() {
              return mockRouterUrl;
            },
            events: routerEvents$.asObservable()
          }
        }
      ]
    });
    service = TestBed.inject(PwaUpdateService);
  });

  afterEach(() => {
    // Elimina cualquier overlay añadido al DOM durante el test
    while (document.body.children.length > bodyChildrenBefore) {
      document.body.lastElementChild!.remove();
    }
  });

  it('no hace nada si SwUpdate no está habilitado', () => {
    mockSwEnabled = false;
    service.init();
    expect(checkForUpdateSpy).not.toHaveBeenCalled();
  });

  it('llama a checkForUpdate al inicializarse', () => {
    service.init();
    expect(checkForUpdateSpy).toHaveBeenCalledOnce();
  });

  it('llama a checkForUpdate cuando la página vuelve a ser visible', () => {
    service.init();
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(checkForUpdateSpy).toHaveBeenCalledTimes(2);
  });

  it('no llama a checkForUpdate cuando la página se oculta', () => {
    service.init();
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(checkForUpdateSpy).toHaveBeenCalledTimes(1);
  });

  it('ignora eventos que no son VERSION_READY', () => {
    service.init();
    versionUpdates$.next({ type: 'VERSION_INSTALLING' });
    expect(document.body.children.length).toBe(bodyChildrenBefore);
  });

  describe('VERSION_READY en ruta segura', () => {
    it('añade el overlay al DOM', () => {
      service.init();
      versionUpdates$.next({ type: 'VERSION_READY' });
      expect(document.body.children.length).toBeGreaterThan(bodyChildrenBefore);
    });
  });

  describe('VERSION_READY en ruta de formulario', () => {
    it('no añade el overlay en /add', () => {
      mockRouterUrl = '/add';
      service.init();
      versionUpdates$.next({ type: 'VERSION_READY' });
      expect(document.body.children.length).toBe(bodyChildrenBefore);
    });

    it('no añade el overlay en /update/:id', () => {
      mockRouterUrl = '/update/123';
      service.init();
      versionUpdates$.next({ type: 'VERSION_READY' });
      expect(document.body.children.length).toBe(bodyChildrenBefore);
    });

    it('añade el overlay al navegar a una ruta segura', () => {
      mockRouterUrl = '/add';
      service.init();
      versionUpdates$.next({ type: 'VERSION_READY' });

      routerEvents$.next(new NavigationEnd(1, '/home', '/home'));
      expect(document.body.children.length).toBeGreaterThan(bodyChildrenBefore);
    });

    it('no añade el overlay al navegar a otra ruta de formulario', () => {
      mockRouterUrl = '/add';
      service.init();
      versionUpdates$.next({ type: 'VERSION_READY' });

      routerEvents$.next(new NavigationEnd(1, '/update/123', '/update/123'));
      expect(document.body.children.length).toBe(bodyChildrenBefore);
    });

    it('no dispara el overlay si no había update pendiente al navegar', () => {
      mockRouterUrl = '/add';
      service.init();

      routerEvents$.next(new NavigationEnd(1, '/home', '/home'));
      expect(document.body.children.length).toBe(bodyChildrenBefore);
    });
  });
});
