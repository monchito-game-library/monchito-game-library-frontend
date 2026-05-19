import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroSearchComponent } from './retro-search.component';

describe('RetroSearchComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroSearchComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('_isDisabled inicia en false', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance._isDisabled()).toBe(false);
  });

  it('_displayValue inicia vacío', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance._displayValue()).toBe('');
  });

  it('writeValue con valor actualiza _displayValue usando displayWith', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('displayWith', (v: string) => `Opción: ${v}`);
    fixture.componentInstance.writeValue('ps5');
    expect(fixture.componentInstance._displayValue()).toBe('Opción: ps5');
    expect(fixture.componentInstance._selectedValue()).toBe('ps5');
  });

  it('writeValue con null limpia _displayValue', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance._displayValue()).toBe('');
    expect(fixture.componentInstance._selectedValue()).toBeNull();
  });

  it('setDisabledState actualiza _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance._isDisabled()).toBe(true);
  });

  it('empty es true cuando no hay valor ni texto', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.empty).toBe(true);
  });

  it('onClear limpia el estado y emite cleared', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue('algo');
    let clearEmitted = false;
    fixture.componentInstance.cleared.subscribe(() => (clearEmitted = true));
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance._displayValue()).toBe('');
    expect(fixture.componentInstance._selectedValue()).toBeNull();
    expect(clearEmitted).toBe(true);
  });

  it('errorState es false sin NgControl', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance.errorState).toBe(false);
  });
});
