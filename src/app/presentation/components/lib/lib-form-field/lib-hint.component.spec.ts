import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibHintComponent } from './lib-hint.component';

describe('LibHintComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibHintComponent]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(LibHintComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
