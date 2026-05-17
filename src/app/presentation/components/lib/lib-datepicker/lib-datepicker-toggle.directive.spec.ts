import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibDatepickerToggleDirective } from './lib-datepicker-toggle.directive';

describe('LibDatepickerToggleDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibDatepickerToggleDirective],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('la directiva existe', () => {
    expect(LibDatepickerToggleDirective).toBeTruthy();
  });
});
