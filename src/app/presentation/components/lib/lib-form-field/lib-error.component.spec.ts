import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibErrorComponent } from './lib-error.component';

describe('LibErrorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibErrorComponent]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(LibErrorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
