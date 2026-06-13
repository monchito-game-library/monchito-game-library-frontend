import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroLabelComponent } from './retro-label.component';

describe('RetroLabelComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroLabelComponent]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroLabelComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
