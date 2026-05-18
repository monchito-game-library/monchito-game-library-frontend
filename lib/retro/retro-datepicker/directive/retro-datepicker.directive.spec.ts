import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroDatepickerDirective } from './retro-datepicker.directive';
import { RetroDatepickerComponent } from '../retro-datepicker.component';

describe('RetroDatepickerDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroDatepickerDirective, RetroDatepickerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('la directiva existe', () => {
    expect(RetroDatepickerDirective).toBeTruthy();
  });
});
