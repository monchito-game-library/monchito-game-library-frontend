import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroOptionComponent } from './retro-option.component';

describe('RetroOptionComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroOptionComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'test');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('selected() inicia en false', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe(false);
  });

  it('setSelected(true) actualiza selected', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.detectChanges();
    fixture.componentInstance.setSelected(true);
    expect(fixture.componentInstance.selected()).toBe(true);
  });
});
