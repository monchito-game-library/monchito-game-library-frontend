import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RetroTabsComponent } from './retro-tabs.component';
import { RetroTabComponent } from './components/retro-tab/retro-tab.component';
import { RetroTabItem } from './interfaces/retro-tab-item.interface';

@Component({
  selector: 'app-tabs-integration-host',
  standalone: true,
  imports: [RetroTabsComponent, RetroTabComponent],
  template: `
    <retro-tabs (selectedIndexChange)="onTabChange($event)">
      <retro-tab label="Disponible" icon="sell">
        <ng-template>Panel disponible</ng-template>
      </retro-tab>
      <retro-tab label="Historial" icon="history">
        <ng-template>Panel historial</ng-template>
      </retro-tab>
    </retro-tabs>
  `
})
class TabsIntegrationHostComponent {
  lastSelectedIndex = -1;

  /**
   * Captura el índice del tab seleccionado.
   *
   * @param {number} index - Índice del tab activo.
   */
  onTabChange(index: number): void {
    this.lastSelectedIndex = index;
  }
}

describe('RetroTabsComponent — casos límite', () => {
  let fixture: ComponentFixture<RetroTabsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [
        RetroTabsComponent,
        RouterLink,
        RouterLinkActive,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroTabsComponent);
    fixture.detectChanges();
  });

  it('select() no hace nada en modo router (isRouterMode=true)', () => {
    const ITEMS: RetroTabItem[] = [{ path: '/a', label: 'A' }];
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();

    const spy = vi.fn();
    fixture.componentInstance.selectedIndexChange.subscribe(spy);
    fixture.componentInstance.select(0);

    expect(spy).not.toHaveBeenCalled();
  });

  it('onKeydown con 0 tabs no lanza error y no emite selectedIndexChange', () => {
    // Sin tabs proyectados, tabsArray().length === 0
    const spy = vi.fn();
    fixture.componentInstance.selectedIndexChange.subscribe(spy);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
    expect(() => fixture.componentInstance.onKeydown(event, 0)).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('M5 — MutationObserver acotado: cambiar clase en descendiente no llama _updateIndicator', async () => {
    // El MutationObserver solo observa childList, por lo que cambios de clase
    // en descendientes no deben disparar _updateIndicator.
    const comp = fixture.componentInstance;
    const spy = vi.spyOn(comp as unknown as { _updateIndicator: () => void }, '_updateIndicator');

    // Simular cambio de clase en un elemento del DOM del componente
    const hostEl = fixture.nativeElement as HTMLElement;
    const child = document.createElement('span');
    child.className = 'some-class';
    hostEl.appendChild(child);

    // Esperar un tick para que el MutationObserver (si estuviera observando atributos) haya disparado
    await new Promise((r) => setTimeout(r, 50));

    // Cambiar la clase del elemento hijo (no debería disparar si solo observa childList)
    child.className = 'another-class';
    await new Promise((r) => setTimeout(r, 50));

    // _updateIndicator pudo llamarse por el childList (appendChild), pero no por el cambio de clase
    const callsAfterAppend = spy.mock.calls.length;
    child.className = 'yet-another-class';
    await new Promise((r) => setTimeout(r, 50));

    expect(spy.mock.calls.length).toBe(callsAfterAppend);
    hostEl.removeChild(child);
  });
});

describe('router mode', () => {
  const ITEMS: RetroTabItem[] = [
    { path: '/tab-a', label: 'Tab A' },
    { path: '/tab-b', label: 'Tab B' },
    { path: '/tab-c', label: 'Tab C' }
  ];

  let fixture: ComponentFixture<RetroTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RetroTabsComponent,
        RouterLink,
        RouterLinkActive,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroTabsComponent);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
  });

  it('should render a nav element when items are provided', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
    expect(nav).toBeTruthy();
    expect(tablist).toBeNull();
  });

  it('should render correct number of anchor links', () => {
    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(ITEMS.length);
  });

  it('should render the retro-tabs__indicator in router mode', () => {
    const indicator = fixture.nativeElement.querySelector('.retro-tabs__indicator');
    expect(indicator).toBeTruthy();
  });

  it('should apply retro-tabs__tab class to each link', () => {
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a');
    links.forEach((link) => {
      expect(link.classList.contains('retro-tabs__tab')).toBe(true);
    });
  });

  it('should set aria-label on nav when ariaLabel is provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'Navegación principal');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Navegación principal');
  });
});

describe('RetroTabsComponent', () => {
  let fixture: ComponentFixture<TabsIntegrationHostComponent>;
  let host: TabsIntegrationHostComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TabsIntegrationHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsIntegrationHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emite selectedIndexChange al hacer click en un tab', () => {
    const spy = vi.spyOn(host, 'onTabChange');
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('muestra el panel correcto para el tab activo', () => {
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].hidden).toBeFalsy();
    expect(panels[1].hidden).toBeTruthy();
  });

  it('cambia la visibilidad del panel al cambiar de tab', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].hidden).toBeTruthy();
    expect(panels[1].hidden).toBeFalsy();
  });

  it('onKeydown con ArrowRight avanza al siguiente tab', () => {
    const tabsComponent = fixture.debugElement.query((el) => el.componentInstance?.onKeydown)?.componentInstance;
    if (!tabsComponent) return;
    const spy = vi.spyOn(host, 'onTabChange');
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
    tabs[0].dispatchEvent(event);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('onKeydown con ArrowLeft retrocede al tab anterior', () => {
    // Primero activar el tab 1
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();

    const spy = vi.spyOn(host, 'onTabChange');
    const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
    tabs[1].dispatchEvent(eventLeft);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('onKeydown con ArrowDown avanza al siguiente tab', () => {
    const spy = vi.spyOn(host, 'onTabChange');
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
    tabs[0].dispatchEvent(event);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('onKeydown con ArrowUp retrocede al tab anterior', () => {
    // Primero activar tab 1
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    const spy = vi.spyOn(host, 'onTabChange');
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
    tabs[1].dispatchEvent(event);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('onKeydown con Home va al primer tab', () => {
    // Primero activar tab 1
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    const spy = vi.spyOn(host, 'onTabChange');
    const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
    tabs[1].dispatchEvent(event);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('onKeydown con End va al último tab', () => {
    const spy = vi.spyOn(host, 'onTabChange');
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
    tabs[0].dispatchEvent(event);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('onKeydown con tecla no reconocida no hace nada', () => {
    const spy = vi.spyOn(host, 'onTabChange');
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    tabs[0].dispatchEvent(event);
    fixture.detectChanges();
    expect(spy).not.toHaveBeenCalled();
  });

  it('onKeydown con ArrowRight hace wrap desde el último tab al primero', () => {
    // Activar el último tab
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    const spy = vi.spyOn(host, 'onTabChange');
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
    tabs[1].dispatchEvent(event);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('M6 — select clamp: índice fuera de bounds queda en el último tab disponible', () => {
    const tabsComp = fixture.debugElement.children[0].componentInstance as RetroTabsComponent;
    // Hay 2 tabs (índices 0 y 1). Pasar índice 10 debe quedar en 1.
    tabsComp.select(10);
    fixture.detectChanges();
    expect(tabsComp.activeIndex()).toBe(1);
  });
});
