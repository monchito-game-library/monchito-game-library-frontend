import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RetroSegmentedComponent } from './retro-segmented.component';
import { RetroSegmentedOption } from './retro-segmented.types';

const OPTIONS: RetroSegmentedOption<string>[] = [
  { value: 'a', label: 'Opción A', icon: 'home' },
  { value: 'b', label: 'Opción B' },
  { value: 'c', label: 'Opción C' }
];

describe('RetroSegmentedComponent', () => {
  let component: RetroSegmentedComponent<string>;
  let fixture: ComponentFixture<RetroSegmentedComponent<string>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [RetroSegmentedComponent]
    }).compileComponents();

    fixture = TestBed.createComponent<RetroSegmentedComponent<string>>(RetroSegmentedComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('value', 'a');
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza un botón por cada opción', () => {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(OPTIONS.length);
  });

  it('el botón activo tiene clase --active', () => {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].classList.contains('retro-segmented-segment--active')).toBe(true);
    expect(buttons[1].classList.contains('retro-segmented-segment--active')).toBe(false);
  });

  it('el botón activo tiene aria-checked="true" y tabindex=0', () => {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].getAttribute('aria-checked')).toBe('true');
    expect(buttons[0].tabIndex).toBe(0);
    expect(buttons[1].getAttribute('aria-checked')).toBe('false');
    expect(buttons[1].tabIndex).toBe(-1);
  });

  it('renderiza el icono cuando la opción lo tiene', () => {
    const icon = fixture.nativeElement.querySelector('.retro-segmented-segment__icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent.trim()).toBe('home');
  });

  it('aplica aria-label al contenedor cuando se proporciona', () => {
    fixture.componentRef.setInput('ariaLabel', 'Selector de tema');
    fixture.detectChanges();
    const container: HTMLElement = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(container.getAttribute('aria-label')).toBe('Selector de tema');
  });

  it('aplica aria-disabled cuando disabled=true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const container: HTMLElement = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(container.getAttribute('aria-disabled')).toBe('true');
  });

  it('no aplica aria-disabled cuando disabled=false', () => {
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    const container: HTMLElement = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(container.getAttribute('aria-disabled')).toBeNull();
  });

  it('onSelect emite el valor seleccionado', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    component.onSelect('b');
    expect(spy).toHaveBeenCalledWith('b');
  });

  it('onSelect no emite cuando el control está deshabilitado', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.changed.subscribe(spy);
    component.onSelect('b');
    expect(spy).not.toHaveBeenCalled();
  });

  it('click en un botón llama a onSelect y emite el valor', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();
    expect(spy).toHaveBeenCalledWith('b');
  });

  it('onKeydown con ArrowRight avanza al siguiente segmento', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    component.onKeydown(event, 0);
    expect(spy).toHaveBeenCalledWith('b');
  });

  it('onKeydown con ArrowDown avanza al siguiente segmento', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    component.onKeydown(event, 1);
    expect(spy).toHaveBeenCalledWith('c');
  });

  it('onKeydown con ArrowRight hace wrap desde el último al primero', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    component.onKeydown(event, 2);
    expect(spy).toHaveBeenCalledWith('a');
  });

  it('onKeydown con ArrowLeft retrocede al segmento anterior', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    component.onKeydown(event, 1);
    expect(spy).toHaveBeenCalledWith('a');
  });

  it('onKeydown con ArrowUp retrocede al segmento anterior', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
    component.onKeydown(event, 2);
    expect(spy).toHaveBeenCalledWith('b');
  });

  it('onKeydown con ArrowLeft hace wrap desde el primero al último', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    component.onKeydown(event, 0);
    expect(spy).toHaveBeenCalledWith('c');
  });

  it('onKeydown con Home va al primer segmento', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true });
    component.onKeydown(event, 2);
    expect(spy).toHaveBeenCalledWith('a');
  });

  it('onKeydown con End va al último segmento', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true });
    component.onKeydown(event, 0);
    expect(spy).toHaveBeenCalledWith('c');
  });

  it('onKeydown con tecla no reconocida no emite ni previene el comportamiento por defecto', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    component.onKeydown(event, 0);
    expect(spy).not.toHaveBeenCalled();
    expect(preventSpy).not.toHaveBeenCalled();
  });

  it('onKeydown no hace nada cuando el control está deshabilitado', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    component.onKeydown(event, 0);
    expect(spy).not.toHaveBeenCalled();
  });

  it('onKeydown no hace nada cuando options está vacía', () => {
    fixture.componentRef.setInput('options', []);
    fixture.detectChanges();
    const spy = vi.fn();
    component.changed.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    expect(() => component.onKeydown(event, 0)).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('cuando ningún valor coincide, el primer botón tiene tabindex=0', () => {
    fixture.componentRef.setInput('value', 'no-existe');
    fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].tabIndex).toBe(0);
    expect(buttons[1].tabIndex).toBe(-1);
  });
});
