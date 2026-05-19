import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroInputComponent } from './retro-input.component';

describe('RetroInputComponent', () => {
  let fixture: ComponentFixture<RetroInputComponent>;
  let component: RetroInputComponent;

  beforeEach(() => {
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
});
