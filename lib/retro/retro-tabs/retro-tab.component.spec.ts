import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { describe, beforeEach, it, expect } from 'vitest';
import { RetroTabsComponent } from './retro-tabs.component';
import { RetroTabComponent } from './retro-tab.component';

@Component({
  selector: 'app-tabs-host',
  standalone: true,
  imports: [RetroTabsComponent, RetroTabComponent],
  template: `
    <retro-tabs>
      <retro-tab label="Tab A" icon="home">
        <ng-template>Contenido A</ng-template>
      </retro-tab>
      <retro-tab label="Tab B" icon="settings">
        <ng-template>Contenido B</ng-template>
      </retro-tab>
    </retro-tabs>
  `
})
class TabsHostComponent {}

describe('RetroTabComponent + RetroTabsComponent', () => {
  let fixture: ComponentFixture<TabsHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsHostComponent);
    fixture.detectChanges();
  });

  it('should render a tablist with 2 tabs', () => {
    const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
    const tabs = tablist.querySelectorAll('[role="tab"]');
    expect(tablist).toBeTruthy();
    expect(tabs.length).toBe(2);
  });

  it('first tab should be selected by default', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should select second tab on click', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('second tab should have tabindex=-1 when not active', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should render tabpanels with correct aria attributes', () => {
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels.length).toBe(2);
  });
});
