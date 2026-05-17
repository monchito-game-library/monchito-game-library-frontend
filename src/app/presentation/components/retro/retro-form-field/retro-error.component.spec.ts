import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroErrorComponent } from './retro-error.component';

describe('RetroErrorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroErrorComponent]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroErrorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
