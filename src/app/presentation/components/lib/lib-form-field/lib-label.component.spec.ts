import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibLabelComponent } from './lib-label.component';

describe('LibLabelComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibLabelComponent]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(LibLabelComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
