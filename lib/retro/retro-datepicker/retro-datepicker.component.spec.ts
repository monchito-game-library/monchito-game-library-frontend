import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroDatepickerComponent } from './retro-datepicker.component';

describe('RetroDatepickerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroDatepickerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('_isOpen inicia en false', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance._isOpen()).toBe(false);
  });

  it('_isDisabled inicia en false', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance._isDisabled()).toBe(false);
  });

  it('writeValue(null) limpia la fecha seleccionada', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance._selectedDate()).toBeNull();
    expect(fixture.componentInstance._displayText()).toBe('');
  });

  it('writeValue con Date establece _selectedDate y _displayText', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const date = new Date(2025, 0, 15); // 15 enero 2025
    fixture.componentInstance.writeValue(date);
    expect(fixture.componentInstance._selectedDate()).toEqual(date);
    expect(fixture.componentInstance._displayText()).toContain('15');
  });

  it('setDisabledState actualiza _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance._isDisabled()).toBe(true);
  });

  it('empty es true cuando no hay fecha seleccionada', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.empty).toBe(true);
  });

  it('empty es false cuando hay fecha seleccionada', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 1));
    expect(fixture.componentInstance.empty).toBe(false);
  });

  it('onClear limpia el estado y emite cleared', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 1));
    let clearEmitted = false;
    fixture.componentInstance.cleared.subscribe(() => (clearEmitted = true));
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance._selectedDate()).toBeNull();
    expect(fixture.componentInstance._displayText()).toBe('');
    expect(clearEmitted).toBe(true);
  });

  it('errorState es false sin NgControl', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance.errorState).toBe(false);
  });
});
