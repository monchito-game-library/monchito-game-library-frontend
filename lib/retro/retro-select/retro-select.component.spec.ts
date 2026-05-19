import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroSelectComponent } from './retro-select.component';

describe('RetroSelectComponent', () => {
  beforeEach(() => {
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
});
