import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroHintComponent } from './retro-hint.component';

describe('RetroHintComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroHintComponent]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroHintComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
