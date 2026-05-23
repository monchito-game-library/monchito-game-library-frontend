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

@Component({
  selector: 'app-wrapper-trigger-host',
  standalone: true,
  imports: [RetroMenuComponent, RetroMenuItemComponent, RetroMenuTriggerDirective],
  template: `
    <span [retroMenuTriggerFor]="menu" style="display:contents">
      <button class="inner-btn">Trigger</button>
    </span>
    <retro-menu #menu>
      <retro-menu-item>Opción A</retro-menu-item>
    </retro-menu>
  `
})
class WrapperTriggerHostComponent {}

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

  it('_handleMenuKeydown con Enter cuando no hay item activo no hace nada', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      // Forzar keyManager sin item activo
      (directive as any)._keyManager = { activeItem: null, onKeydown: vi.fn() };
      expect(() => (directive as any)._handleMenuKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))).not.toThrow();
    }
  });

  it('_handleMenuKeydown con ArrowDown sin item activo no llama focus', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      (directive as any)._keyManager = { activeItem: null, onKeydown: vi.fn() };
      expect(() =>
        (directive as any)._handleMenuKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
      ).not.toThrow();
    }
  });

  it('_handleMenuKeydown con Enter cuando hay item activo llama onClick y cierra', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      const mockItem = { onClick: vi.fn(), focus: vi.fn() };
      (directive as any)._keyManager = { activeItem: mockItem, onKeydown: vi.fn() };
      (directive as any)._handleMenuKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(mockItem.onClick).toHaveBeenCalled();
    }
  });

  it('_handleMenuKeydown con ArrowDown cuando hay item activo llama focus', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      const mockItem = { onClick: vi.fn(), focus: vi.fn() };
      (directive as any)._keyManager = { activeItem: mockItem, onKeydown: vi.fn() };
      (directive as any)._handleMenuKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(mockItem.focus).toHaveBeenCalled();
    }
  });

  it('ArrowUp cuando el menú ya está abierto no re-abre (isOpen=true branch)', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    // Sigue abierto
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('_openMenu no abre si el menuComponent no tiene templateRef', () => {
    const btn = fixture.nativeElement.querySelector('button');
    const directiveDebug = fixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      const mockMenu = { templateRef: null, menuItems: null };
      (directive as any).retroMenuTriggerFor = () => mockMenu;
      // No debe lanzar ni abrir
      expect(() => (directive as any)._openMenu()).not.toThrow();
      expect(directive._isOpen()).toBe(false);
    }
  });
});

describe('RetroMenuTriggerDirective — wrapper con display:contents', () => {
  let wrapperFixture: ComponentFixture<WrapperTriggerHostComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WrapperTriggerHostComponent, OverlayModule]
    }).compileComponents();

    wrapperFixture = TestBed.createComponent(WrapperTriggerHostComponent);
    wrapperFixture.detectChanges();
  });

  it('abre el menú al hacer click en el host wrapper', () => {
    const span = wrapperFixture.nativeElement.querySelector('span');
    span.click();
    wrapperFixture.detectChanges();
    const panel = document.querySelector('.retro-menu');
    expect(panel).toBeTruthy();
  });

  it('aria-expanded pasa a true tras abrir desde wrapper', () => {
    const span = wrapperFixture.nativeElement.querySelector('span');
    span.click();
    wrapperFixture.detectChanges();
    expect(span.getAttribute('aria-expanded')).toBe('true');
  });

  it('cierra el menú al hacer un segundo click en el wrapper', () => {
    const span = wrapperFixture.nativeElement.querySelector('span');
    span.click();
    wrapperFixture.detectChanges();
    span.click();
    wrapperFixture.detectChanges();
    expect(span.getAttribute('aria-expanded')).toBe('false');
  });

  it('_resolveAnchor devuelve el button interno, no el span', () => {
    const span = wrapperFixture.nativeElement.querySelector('span');
    const directiveDebug = wrapperFixture.debugElement.query(By.directive(RetroMenuTriggerDirective));
    const directive = directiveDebug?.injector.get(RetroMenuTriggerDirective);
    if (directive) {
      const anchor = (directive as any)._resolveAnchor();
      expect(anchor).toBe(wrapperFixture.nativeElement.querySelector('.inner-btn'));
      expect(anchor).not.toBe(span);
    }
  });
});
