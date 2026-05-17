import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibSelectComponent } from './lib-select.component';

describe('LibSelectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibSelectComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(LibSelectComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('open() inicia en false', () => {
    const fixture = TestBed.createComponent(LibSelectComponent);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('writeValue actualiza _value', () => {
    const fixture = TestBed.createComponent(LibSelectComponent);
    fixture.componentInstance.writeValue('ps5');
    expect(fixture.componentInstance._value()).toBe('ps5');
  });

  it('setDisabledState actualiza _isDisabled', () => {
    const fixture = TestBed.createComponent(LibSelectComponent);
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance._isDisabled()).toBe(true);
  });
});
