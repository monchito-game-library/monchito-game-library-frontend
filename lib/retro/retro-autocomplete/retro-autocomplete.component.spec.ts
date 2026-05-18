import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroAutocompleteComponent } from './retro-autocomplete.component';

describe('RetroAutocompleteComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroAutocompleteComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroAutocompleteComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isOpen() inicia en false', () => {
    const fixture = TestBed.createComponent(RetroAutocompleteComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isOpen()).toBe(false);
  });
});
