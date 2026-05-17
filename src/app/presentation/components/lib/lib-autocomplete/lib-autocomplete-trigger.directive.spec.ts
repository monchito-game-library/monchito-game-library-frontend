import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibAutocompleteTriggerDirective } from './lib-autocomplete-trigger.directive';
import { LibAutocompleteComponent } from './lib-autocomplete.component';

@Component({
  standalone: true,
  imports: [LibAutocompleteTriggerDirective, LibAutocompleteComponent],
  template: `
    <input type="text" [retroAutocompleteTrigger]="auto" />
    <retro-autocomplete #auto />
  `,
  schemas: [NO_ERRORS_SCHEMA]
})
class TestHostComponent {}

describe('LibAutocompleteTriggerDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(LibAutocompleteTriggerDirective));
    expect(directive).toBeTruthy();
  });
});
