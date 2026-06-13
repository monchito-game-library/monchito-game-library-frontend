import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RetroMenuItemComponent } from './retro-menu-item.component';

describe('RetroMenuItemComponent', () => {
  let fixture: ComponentFixture<RetroMenuItemComponent>;
  let component: RetroMenuItemComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [RetroMenuItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza con role="none" en li y role="menuitem" en button', () => {
    const li = fixture.nativeElement.querySelector('li');
    const btn = fixture.nativeElement.querySelector('button');
    expect(li?.getAttribute('role')).toBe('none');
    expect(btn?.getAttribute('role')).toBe('menuitem');
  });

  it('deshabilita el botón cuando isDisabled es true', () => {
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.disabled).toBeTruthy();
  });

  it('emite clicked al hacer click cuando no está deshabilitado', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
  });

  it('no emite clicked cuando onClick se llama y está deshabilitado', () => {
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.clicked.subscribe(spy);
    component.onClick(new MouseEvent('click'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('renderiza el icono cuando se proporciona el input icon', () => {
    fixture.componentRef.setInput('icon', 'delete');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('retro-icon');
    expect(icon).toBeTruthy();
  });

  it('disabled getter devuelve el valor de isDisabled', () => {
    expect(component.disabled).toBe(false);
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    expect(component.disabled).toBe(true);
  });

  it('setActiveStyles mueve el foco al botón interno', () => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const focusSpy = vi.spyOn(btn, 'focus');
    component.setActiveStyles();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('setInactiveStyles no lanza error', () => {
    expect(() => component.setInactiveStyles()).not.toThrow();
  });

  it('focus() enfoca el botón interno', () => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const focusSpy = vi.spyOn(btn, 'focus');
    component.focus();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('getLabel() devuelve el texto del nodo', () => {
    const label = component.getLabel();
    expect(typeof label).toBe('string');
  });
});
