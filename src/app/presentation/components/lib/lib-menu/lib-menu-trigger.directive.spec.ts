import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { describe, beforeEach, it, expect } from 'vitest';
import { LibMenuComponent } from './lib-menu.component';
import { LibMenuItemComponent } from './lib-menu-item.component';
import { LibMenuTriggerDirective } from './lib-menu-trigger.directive';

@Component({
  selector: 'app-trigger-host',
  standalone: true,
  imports: [LibMenuComponent, LibMenuItemComponent, LibMenuTriggerDirective],
  template: `
    <button [retroMenuTriggerFor]="menu" aria-label="Abrir menú">Trigger</button>
    <retro-menu #menu>
      <retro-menu-item>Opción A</retro-menu-item>
      <retro-menu-item>Opción B</retro-menu-item>
    </retro-menu>
  `
})
class TriggerHostComponent {}

describe('LibMenuTriggerDirective', () => {
  let fixture: ComponentFixture<TriggerHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriggerHostComponent, OverlayModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TriggerHostComponent);
    fixture.detectChanges();
  });

  it('should apply aria-haspopup="menu" to the trigger', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('should have aria-expanded="false" initially', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open the menu overlay on click', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const panel = document.querySelector('.lib-menu');
    expect(panel).toBeTruthy();
  });

  it('should close the menu on second click', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});
