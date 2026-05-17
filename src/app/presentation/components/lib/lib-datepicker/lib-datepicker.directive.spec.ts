import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibDatepickerDirective } from './lib-datepicker.directive';
import { LibDatepickerComponent } from './lib-datepicker.component';

describe('LibDatepickerDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibDatepickerDirective, LibDatepickerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('la directiva existe', () => {
    expect(LibDatepickerDirective).toBeTruthy();
  });
});
