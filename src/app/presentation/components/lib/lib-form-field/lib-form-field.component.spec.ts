import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibFormFieldComponent } from './lib-form-field.component';

describe('LibFormFieldComponent', () => {
  let component: LibFormFieldComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibFormFieldComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(LibFormFieldComponent);
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
