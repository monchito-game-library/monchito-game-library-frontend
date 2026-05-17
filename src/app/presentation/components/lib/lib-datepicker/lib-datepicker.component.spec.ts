import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibDatepickerComponent } from './lib-datepicker.component';

describe('LibDatepickerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibDatepickerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(LibDatepickerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isOpen() inicia en false', () => {
    const fixture = TestBed.createComponent(LibDatepickerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isOpen()).toBe(false);
  });

  it('setDate(null) limpia la fecha seleccionada', () => {
    const fixture = TestBed.createComponent(LibDatepickerComponent);
    fixture.detectChanges();
    fixture.componentInstance.setDate(null);
    expect(fixture.componentInstance._selectedDate()).toBeNull();
  });
});
