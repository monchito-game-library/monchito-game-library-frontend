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
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isOpen() inicia en false', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isOpen()).toBe(false);
  });

  it('setDate(null) limpia la fecha seleccionada', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.detectChanges();
    fixture.componentInstance.setDate(null);
    expect(fixture.componentInstance._selectedDate()).toBeNull();
  });
});
