import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroFormFieldComponent } from './retro-form-field.component';

describe('RetroFormFieldComponent', () => {
  let component: RetroFormFieldComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroFormFieldComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(RetroFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('focused() inicia en false', () => {
    expect(component.focused()).toBe(false);
  });

  it('invalid() inicia en false', () => {
    expect(component.invalid()).toBe(false);
  });
});
