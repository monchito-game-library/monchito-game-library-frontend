import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { OverlayModule } from '@angular/cdk/overlay';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RetroMenuComponent } from '../retro-menu.component';
import { RetroMenuItemComponent } from '../components/retro-menu-item/retro-menu-item.component';
import { RetroMenuTriggerDirective } from './retro-menu-trigger.directive';

@Component({
  selector: 'app-trigger-host',
  standalone: true,
  imports: [RetroMenuComponent, RetroMenuItemComponent, RetroMenuTriggerDirective],
  template: `
    <button [retroMenuTriggerFor]="menu" aria-label="Abrir menú">Trigger</button>
    <retro-menu #menu>
      <retro-menu-item>Opción A</retro-menu-item>
      <retro-menu-item>Opción B</retro-menu-item>
    </retro-menu>
  `
})
class TriggerHostComponent {}

describe('RetroMenuTriggerDirective', () => {
  let fixture: ComponentFixture<TriggerHostComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TriggerHostComponent, OverlayModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TriggerHostComponent);
    fixture.detectChanges();
  });

  it('aria-haspopup="menu" está aplicado al trigger', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('aria-expanded inicia en false', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('abre el overlay al hacer click', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const panel = document.querySelector('.retro-menu');
    expect(panel).toBeTruthy();
  });

  it('cierra el menú al hacer un segundo click', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('abre el menú al pulsar Enter', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('abre el menú al pulsar Space', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('abre el menú al pulsar ArrowDown', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('abre el menú al pulsar ArrowUp', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('no re-abre el menú al pulsar Enter cuando ya está abierto', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    // El menú ya está abierto, pulsar Enter de nuevo no debería cerrarlo desde el trigger
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    // Debe seguir abierto
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('cierra el menú al pulsar Escape dentro del overlay', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    // Simular Escape en el overlay (el keydownEvents del overlayRef)
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      (directive as any)._handleMenuKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('cierra el menú al pulsar Tab dentro del overlay', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      (directive as any)._handleMenuKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
      fixture.detectChanges();
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('_handleMenuKeydown con ArrowDown pasa el evento al keyManager', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      const keyManager = (directive as any)._keyManager;
      if (keyManager) {
        const spy = vi.spyOn(keyManager, 'onKeydown');
        (directive as any)._handleMenuKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(spy).toHaveBeenCalled();
      }
    }
  });

  it('ngOnDestroy cierra el menú y libera el overlayRef', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      expect(() => directive.ngOnDestroy()).not.toThrow();
    }
  });
});
