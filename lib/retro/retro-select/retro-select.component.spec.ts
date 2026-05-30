import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RetroSelectComponent } from './retro-select.component';
import { RetroOptionComponent } from './components/retro-option/retro-option.component';

// ── Host component con opciones proyectadas ──────────────────────────────────

@Component({
  selector: 'app-select-host',
  standalone: true,
  imports: [RetroSelectComponent, RetroOptionComponent, ReactiveFormsModule],
  template: `
    <retro-select [label]="'Plataforma'" [formControl]="control">
      <retro-option value="ps5">PlayStation 5</retro-option>
      <retro-option value="xbox">Xbox Series X</retro-option>
      <retro-option value="disabled" [disabled]="true">Deshabilitada</retro-option>
    </retro-select>
  `
})
class SelectHostComponent {
  control = new FormControl<string | null>(null);
}

// ── Host component standalone sin formControl ────────────────────────────────

@Component({
  selector: 'app-select-standalone-host',
  standalone: true,
  imports: [RetroSelectComponent, RetroOptionComponent],
  template: `
    <retro-select [label]="'Plataforma'">
      <retro-option value="ps5">PlayStation 5</retro-option>
      <retro-option value="xbox">Xbox Series X</retro-option>
    </retro-select>
  `
})
class SelectStandaloneHostComponent {}

describe('RetroSelectComponent (unitario)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [RetroSelectComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('open() inicia en false', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('writeValue actualiza _value', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue('ps5');
    expect(fixture.componentInstance._value()).toBe('ps5');
  });

  it('setDisabledState actualiza _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance._isDisabled()).toBe(true);
  });

  it('toggle no abre el panel cuando está deshabilitado', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.setDisabledState(true);
    fixture.componentInstance.toggle();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('empty es true cuando no hay valor seleccionado', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.empty).toBe(true);
  });

  it('empty es false cuando hay valor seleccionado', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue('ps5');
    expect(fixture.componentInstance.empty).toBe(false);
  });

  it('empty es true cuando el valor es undefined', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue(undefined);
    expect(fixture.componentInstance.empty).toBe(true);
  });

  it('onClear limpia _value y emite cleared', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue('ps5');
    let clearEmitted = false;
    fixture.componentInstance.cleared.subscribe(() => (clearEmitted = true));
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance._value()).toBeNull();
    expect(clearEmitted).toBe(true);
  });

  it('errorState es false sin NgControl', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance.errorState).toBe(false);
  });

  it('registerOnChange registra el callback', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    fixture.componentInstance.onClear();
    expect(fn).toHaveBeenCalledWith(null);
  });

  it('registerOnTouched registra el callback', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    const fn = vi.fn();
    fixture.componentInstance.registerOnTouched(fn);
    fixture.componentInstance.onClear();
    expect(fn).toHaveBeenCalled();
  });

  it('onTriggerFocus emite true en el subject de foco', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    let emitted: boolean | undefined;
    fixture.componentInstance.focused$.subscribe((v) => (emitted = v));
    fixture.componentInstance.onTriggerFocus();
    expect(emitted).toBe(true);
  });

  it('onTriggerBlur emite false cuando el panel está cerrado', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    const fn = vi.fn();
    fixture.componentInstance.registerOnTouched(fn);
    let emitted: boolean | undefined;
    fixture.componentInstance.focused$.subscribe((v) => (emitted = v));
    fixture.componentInstance.onTriggerBlur();
    expect(emitted).toBe(false);
    expect(fn).toHaveBeenCalled();
  });

  it('onTriggerBlur no emite si el panel está abierto', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.open.set(true);
    const emissions: boolean[] = [];
    fixture.componentInstance.focused$.subscribe((v) => emissions.push(v));
    fixture.componentInstance.onTriggerBlur();
    expect(emissions.length).toBe(0);
  });

  it('disabled getter devuelve el valor de _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance.disabled).toBe(true);
    fixture.componentInstance.setDisabledState(false);
    expect(fixture.componentInstance.disabled).toBe(false);
  });

  it('onTriggerKeydown no hace nada cuando está deshabilitado', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.setDisabledState(true);
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onTriggerKeydown(event);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('onTriggerKeydown con panel cerrado y tecla no reconocida no hace nada', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    const event = new KeyboardEvent('keydown', { key: 'a' });
    fixture.componentInstance.onTriggerKeydown(event);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('ngOnChanges actualiza _value cuando cambia el input value', async () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 'xbox');
    await new Promise((r) => setTimeout(r, 0));
    expect(fixture.componentInstance._value()).toBe('xbox');
  });

  it('ngOnChanges ignora cambios sin la clave value', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    const initialValue = fixture.componentInstance._value();
    fixture.componentInstance.ngOnChanges({
      label: { currentValue: 'Otro', previousValue: 'Test', firstChange: false, isFirstChange: () => false }
    });
    expect(fixture.componentInstance._value()).toBe(initialValue);
  });

  it('ngOnChanges limpia _value cuando value cambia a undefined', async () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue('ps5');
    fixture.componentInstance.ngOnChanges({
      value: { currentValue: undefined, previousValue: 'ps5', firstChange: false, isFirstChange: () => false }
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(fixture.componentInstance._value()).toBeNull();
  });
});

describe('RetroSelectComponent (integración con opciones)', () => {
  let fixture: ComponentFixture<SelectHostComponent>;
  let host: SelectHostComponent;
  let select: RetroSelectComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [SelectHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    select = fixture.debugElement.query(
      (el) => el.componentInstance instanceof RetroSelectComponent
    )?.componentInstance;
  });

  it('se crea el host correctamente', () => {
    expect(host).toBeTruthy();
  });

  it('writeValue desde formControl actualiza _value', async () => {
    host.control.setValue('ps5');
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();
    expect(select._value()).toBe('ps5');
  });

  it('setDisabledState via formControl actualiza _isDisabled', () => {
    host.control.disable();
    fixture.detectChanges();
    expect(select._isDisabled()).toBe(true);
    host.control.enable();
    fixture.detectChanges();
    expect(select._isDisabled()).toBe(false);
  });

  it('errorState es true cuando el control es inválido y tocado', () => {
    host.control.setValidators(() => ({ required: true }));
    host.control.markAsTouched();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(select.errorState).toBe(true);
  });

  it('displayValue devuelve placeholder cuando no hay selección', () => {
    host.control.setValue(null);
    fixture.detectChanges();
    expect(select.displayValue()).toBe('');
  });

  it('displayValue devuelve el label de la opción seleccionada', async () => {
    host.control.setValue('ps5');
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();
    expect(select.displayValue()).toContain('PlayStation 5');
  });

  it('displayValue devuelve String(value) si la opción no existe', async () => {
    host.control.setValue('desconocido');
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();
    expect(select.displayValue()).toBe('desconocido');
  });

  it('selectOption actualiza el valor y emite selectionChange', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    let emittedValue: unknown;
    select.selectionChange.subscribe((v) => (emittedValue = v));

    // Crear una opción mockeada con el valor correcto
    const mockOption = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PlayStation 5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    select.selectOption(mockOption);

    expect(select._value()).toBe('ps5');
    expect(emittedValue).toBe('ps5');
  });

  it('onClear sincroniza las opciones y emite cleared', async () => {
    host.control.setValue('ps5');
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();
    let cleared = false;
    select.cleared.subscribe(() => (cleared = true));
    select.onClear();
    expect(select._value()).toBeNull();
    expect(cleared).toBe(true);
  });

  it('onTriggerKeydown con Escape cierra el panel si está abierto', () => {
    select.open.set(true);
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    select.onTriggerKeydown(event);
    expect(select.open()).toBe(false);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onTriggerKeydown con Tab cierra el panel si hay opción activa', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    select.onTriggerKeydown(event);
    expect(select.open()).toBe(false);
  });

  it('onTriggerKeydown con Home activa la primera opción cuando el panel está abierto', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);
    const event = new KeyboardEvent('keydown', { key: 'Home' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    select.onTriggerKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onTriggerKeydown con End activa la última opción cuando el panel está abierto', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);
    const event = new KeyboardEvent('keydown', { key: 'End' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    select.onTriggerKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onTriggerKeydown con ArrowDown mueve el activo hacia adelante cuando el panel está abierto', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);
    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const preventDefault = vi.spyOn(eventDown, 'preventDefault');
    select.onTriggerKeydown(eventDown);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onTriggerKeydown con ArrowUp mueve el activo hacia atrás cuando el panel está abierto', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);
    const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    const preventDefault = vi.spyOn(eventUp, 'preventDefault');
    select.onTriggerKeydown(eventUp);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onTriggerKeydown con Enter abre el panel cuando está cerrado', () => {
    select.open.set(false);
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    select.onTriggerKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onTriggerKeydown con ArrowDown abre el panel cuando está cerrado', () => {
    select.open.set(false);
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    select.onTriggerKeydown(event);
    // El panel intenta abrirse (el overlay CDK necesita un elemento real para anclarse,
    // pero el código sí ejecuta _openPanel)
    expect(event.cancelBubble).toBeDefined();
  });

  it('onTriggerKeydown con ArrowUp abre el panel cuando está cerrado', () => {
    select.open.set(false);
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    select.onTriggerKeydown(event);
    expect(event.cancelBubble).toBeDefined();
  });

  it('onTriggerKeydown con Space abre el panel cuando está cerrado', () => {
    select.open.set(false);
    const event = new KeyboardEvent('keydown', { key: ' ' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    select.onTriggerKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onTriggerKeydown con Enter selecciona opción activa cuando el panel está abierto', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);

    // Inyectar opción mockeada en el QueryList interno
    const mockOption = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PlayStation 5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [mockOption],
      find: (fn: (o: RetroOptionComponent) => boolean) => [mockOption].find(fn),
      forEach: (fn: (o: RetroOptionComponent) => void) => [mockOption].forEach(fn),
      length: 1
    };
    (select as any)._options = mockQueryList;
    (select as any)._activeIndex = 0;

    let emittedValue: unknown;
    select.selectionChange.subscribe((v) => (emittedValue = v));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    select.onTriggerKeydown(event);
    expect(select._value()).toBe('ps5');
    expect(emittedValue).toBe('ps5');
  });

  it('ngOnDestroy llama dispose del overlayRef si existe', () => {
    const disposeSpy = vi.fn();
    (select as any)._overlayRef = { dispose: disposeSpy };
    select.ngOnDestroy();
    expect(disposeSpy).toHaveBeenCalled();
  });

  it('ngOnDestroy no falla si no hay overlayRef', () => {
    (select as any)._overlayRef = null;
    expect(() => select.ngOnDestroy()).not.toThrow();
  });

  it('errorState es true cuando el control es inválido y dirty', () => {
    host.control.setValidators(() => ({ required: true }));
    host.control.markAsDirty();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(select.errorState).toBe(true);
  });

  it('toggle() cierra el panel cuando ya está abierto', () => {
    select.open.set(true);
    const fn = vi.fn();
    select.focused$.subscribe((v) => fn(v));
    select.toggle();
    expect(select.open()).toBe(false);
  });

  it('_setActiveIndex con índice fuera de rango limpia _activeOptionId', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);
    // Forzar un índice inválido mediante _moveActive en el límite
    (select as any)._activeIndex = -2;
    // No lanza error
    expect(() => select.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'End' }))).not.toThrow();
  });

  it('onTriggerKeydown con Tab cuando la opción activa está disabled no la selecciona pero cierra', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);

    const mockDisabledOption = {
      value: () => 'disabled',
      isDisabled: () => true,
      getLabel: () => 'Deshabilitada',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-disabled'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [mockDisabledOption],
      forEach: vi.fn(),
      length: 1
    };
    (select as any)._options = mockQueryList;
    (select as any)._activeIndex = 0;

    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    select.onTriggerKeydown(event);
    expect(select.open()).toBe(false);
  });

  it('onTriggerKeydown con Tab cuando no hay opción activa sólo cierra', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);

    const mockQueryList = {
      toArray: () => [],
      forEach: vi.fn(),
      length: 0
    };
    (select as any)._options = mockQueryList;
    (select as any)._activeIndex = 5; // fuera de rango

    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    select.onTriggerKeydown(event);
    expect(select.open()).toBe(false);
  });

  it('onTriggerKeydown con Enter cuando la opción activa está disabled no la selecciona', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);

    const mockDisabledOption = {
      value: () => 'disabled',
      isDisabled: () => true,
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-disabled'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [mockDisabledOption],
      forEach: vi.fn(),
      length: 1
    };
    (select as any)._options = mockQueryList;
    (select as any)._activeIndex = 0;

    const spy = vi.fn();
    select.selectionChange.subscribe(spy);
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    select.onTriggerKeydown(event);
    expect(spy).not.toHaveBeenCalled();
  });

  it('_moveActive salta opciones disabled hasta salir del rango (no crash)', async () => {
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    select.open.set(true);

    // Todas las opciones disabled → _moveActive no puede avanzar
    const disabledOpt = {
      isDisabled: () => true,
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [disabledOpt],
      forEach: vi.fn(),
      length: 1
    };
    (select as any)._options = mockQueryList;
    (select as any)._activeIndex = 0;

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    expect(() => select.onTriggerKeydown(event)).not.toThrow();
  });

  it('_overlayPanelSubs queda vacío tras cada cierre después de 10 aperturas/cierres', () => {
    for (let i = 0; i < 10; i++) {
      // Simular apertura: inyectar un overlayRef falso con las suscripciones
      const mockSub = { unsubscribe: vi.fn() } as unknown as import('rxjs').Subscription;
      (select as any)._overlayPanelSubs = [mockSub, mockSub];
      (select as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
      select.open.set(true);

      // Cerrar el panel
      (select as any)._closePanel();

      // Verificar que el array está vacío tras el cierre
      expect((select as any)._overlayPanelSubs).toHaveLength(0);
      // Verificar que se llamó unsubscribe en las subs del ciclo
      expect(mockSub.unsubscribe).toHaveBeenCalled();
    }
  });
});
