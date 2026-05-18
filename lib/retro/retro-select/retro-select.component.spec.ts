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
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('open() inicia en false', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('writeValue actualiza _value', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentInstance.writeValue('ps5');
    expect(fixture.componentInstance._value()).toBe('ps5');
  });

  it('setDisabledState actualiza _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroSelectComponent);
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance._isDisabled()).toBe(true);
  });
});
