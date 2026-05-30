import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RetroInputComponent } from './retro-input.component';

@Component({
  selector: 'app-input-form-host',
  standalone: true,
  imports: [RetroInputComponent, ReactiveFormsModule],
  template: `<retro-input label="Test" [formControl]="control" />`
})
class InputFormHostComponent {
  control = new FormControl<string | null>('');
}

describe('RetroInputComponent', () => {
  let fixture: ComponentFixture<RetroInputComponent>;
  let component: RetroInputComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [RetroInputComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(RetroInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test label');
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('_isDisabled inicia en false', () => {
    expect(component._isDisabled()).toBe(false);
  });

  it('writeValue actualiza _displayValue', () => {
    component.writeValue('hola mundo');
    expect(component._displayValue()).toBe('hola mundo');
  });

  it('writeValue con null limpia _displayValue', () => {
    component.writeValue(null);
    expect(component._displayValue()).toBe('');
  });

  it('setDisabledState actualiza _isDisabled', () => {
    component.setDisabledState(true);
    expect(component._isDisabled()).toBe(true);
  });

  it('empty es true cuando no hay valor', () => {
    component.writeValue('');
    expect(component.empty).toBe(true);
  });

  it('empty es false cuando hay valor', () => {
    component.writeValue('algo');
    expect(component.empty).toBe(false);
  });

  it('onClear limpia el valor y emite cleared', () => {
    component.writeValue('valor previo');
    let clearEmitted = false;
    component.cleared.subscribe(() => (clearEmitted = true));
    component.onClear();
    expect(component._displayValue()).toBe('');
    expect(clearEmitted).toBe(true);
  });

  it('errorState es false sin NgControl', () => {
    expect(component.errorState).toBe(false);
  });

  it('disabled getter devuelve _isDisabled', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
    component.setDisabledState(false);
    expect(component.disabled).toBe(false);
  });

  it('onInput actualiza _displayValue y llama onChange', () => {
    const changeFn = vi.fn();
    component.registerOnChange(changeFn);
    const event = { target: { value: 'nuevo valor' } } as unknown as Event;
    component.onInput(event);
    expect(component._displayValue()).toBe('nuevo valor');
    expect(changeFn).toHaveBeenCalledWith('nuevo valor');
  });

  it('onBlur emite false al focusSubject y llama onTouched', () => {
    const touchedFn = vi.fn();
    component.registerOnTouched(touchedFn);
    let emitted: boolean | undefined;
    component.focused$.subscribe((v) => (emitted = v));
    const event = new FocusEvent('blur');
    component.onBlur(event);
    expect(emitted).toBe(false);
    expect(touchedFn).toHaveBeenCalled();
  });

  it('onBlur emite el evento blur al output blur', () => {
    let blurEvent: FocusEvent | undefined;
    component.blur.subscribe((e) => (blurEvent = e));
    const event = new FocusEvent('blur');
    component.onBlur(event);
    expect(blurEvent).toBe(event);
  });

  it('onFocus emite true al focusSubject', () => {
    let emitted: boolean | undefined;
    component.focused$.subscribe((v) => (emitted = v));
    const event = new FocusEvent('focus');
    component.onFocus(event);
    expect(emitted).toBe(true);
  });

  it('onFocus emite el evento focus al output focus', () => {
    let focusEvent: FocusEvent | undefined;
    component.focus.subscribe((e) => (focusEvent = e));
    const event = new FocusEvent('focus');
    component.onFocus(event);
    expect(focusEvent).toBe(event);
  });

  it('onKeydown emite el output enter al pulsar Enter', () => {
    let enterEvent: KeyboardEvent | undefined;
    component.enter.subscribe((e) => (enterEvent = e));
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeydown(event);
    expect(enterEvent).toBe(event);
  });

  it('onKeydown no emite enter con otras teclas', () => {
    let enterEvent: KeyboardEvent | undefined;
    component.enter.subscribe((e) => (enterEvent = e));
    const event = new KeyboardEvent('keydown', { key: 'a' });
    component.onKeydown(event);
    expect(enterEvent).toBeUndefined();
  });

  it('onClear llama onChange con "" y onTouched', () => {
    const changeFn = vi.fn();
    const touchedFn = vi.fn();
    component.registerOnChange(changeFn);
    component.registerOnTouched(touchedFn);
    component.onClear();
    expect(changeFn).toHaveBeenCalledWith('');
    expect(touchedFn).toHaveBeenCalled();
  });

  it('writeValue con null normaliza a "" internamente', () => {
    component.writeValue(null);
    expect(component._displayValue()).toBe('');
    expect(component.empty).toBe(true);
  });
});

describe('RetroInputComponent (con FormControl)', () => {
  let fixture: ComponentFixture<InputFormHostComponent>;
  let host: InputFormHostComponent;
  let input: RetroInputComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [InputFormHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InputFormHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query((el) => el.componentInstance instanceof RetroInputComponent)?.componentInstance;
  });

  it('ngControl se establece en ngOnInit', () => {
    expect(input.ngControl).not.toBeNull();
  });

  it('errorState es true cuando el control es inválido y tocado', () => {
    host.control.setValidators(() => ({ required: true }));
    host.control.markAsTouched();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(input.errorState).toBe(true);
  });

  it('errorState es false cuando el control es válido', () => {
    host.control.clearValidators();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(input.errorState).toBe(false);
  });

  it('errorState es true cuando el control es inválido y dirty (no touched)', () => {
    host.control.setValidators(() => ({ required: true }));
    host.control.markAsDirty();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(input.errorState).toBe(true);
  });
});
