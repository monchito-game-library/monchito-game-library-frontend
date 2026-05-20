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
    await TestBed.configureTestingModule({
      imports: [TabsIntegrationHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsIntegrationHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit selectedIndexChange when a tab is clicked', () => {
    const spy = vi.spyOn(host, 'onTabChange');
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should show correct panel content for active tab', () => {
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].hidden).toBeFalsy();
    expect(panels[1].hidden).toBeTruthy();
  });

  it('should switch panel visibility when tab changes', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].hidden).toBeTruthy();
    expect(panels[1].hidden).toBeFalsy();
  });
});
