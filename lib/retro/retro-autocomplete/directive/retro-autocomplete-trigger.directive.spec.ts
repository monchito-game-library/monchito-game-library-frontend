import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroAutocompleteTriggerDirective } from './retro-autocomplete-trigger.directive';
import { RetroAutocompleteComponent } from '../retro-autocomplete.component';

@Component({
  standalone: true,
  imports: [RetroAutocompleteTriggerDirective, RetroAutocompleteComponent],
  template: `
    <input type="text" [retroAutocompleteTrigger]="auto" />
    <retro-autocomplete #auto />
  `,
  schemas: [NO_ERRORS_SCHEMA]
})
class TestHostComponent {}

describe('RetroAutocompleteTriggerDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(RetroAutocompleteTriggerDirective));
    expect(directive).toBeTruthy();
  });
});
