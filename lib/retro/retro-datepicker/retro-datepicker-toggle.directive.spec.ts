import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroDatepickerToggleDirective } from './retro-datepicker-toggle.directive';

describe('RetroDatepickerToggleDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroDatepickerToggleDirective],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('la directiva existe', () => {
    expect(RetroDatepickerToggleDirective).toBeTruthy();
  });
});
