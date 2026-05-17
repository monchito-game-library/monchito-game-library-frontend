import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibAutocompleteComponent } from './lib-autocomplete.component';

describe('LibAutocompleteComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibAutocompleteComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(LibAutocompleteComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isOpen() inicia en false', () => {
    const fixture = TestBed.createComponent(LibAutocompleteComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isOpen()).toBe(false);
  });
});
