import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RetroTabsComponent } from './retro-tabs.component';
import { RetroTabComponent } from './retro-tab.component';

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
