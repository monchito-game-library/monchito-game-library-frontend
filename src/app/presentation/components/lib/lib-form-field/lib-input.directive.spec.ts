import { Component, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, beforeEach, expect, it } from 'vitest';

import { LibInputDirective } from './lib-input.directive';

@Component({
  standalone: true,
  imports: [LibInputDirective],
  template: `<input libInput type="text" />`
})
class TestHostComponent {}

describe('LibInputDirective', () => {
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    de = fixture.debugElement.query(By.directive(LibInputDirective));
  });

  it('añade la clase lib-input__control al host', () => {
    expect(de.nativeElement.classList).toContain('lib-input__control');
  });

  it('emite true en focusChange$ al recibir focus', () => {
    const directive: LibInputDirective = de.injector.get(LibInputDirective);
    let emitted: boolean | undefined;
    directive.focusChange$.subscribe((v) => (emitted = v));

    de.nativeElement.dispatchEvent(new FocusEvent('focus'));

    expect(emitted).toBe(true);
  });

  it('emite false en focusChange$ al perder el foco (blur)', () => {
    const directive: LibInputDirective = de.injector.get(LibInputDirective);
    let emitted: boolean | undefined;
    directive.focusChange$.subscribe((v) => (emitted = v));

    de.nativeElement.dispatchEvent(new FocusEvent('blur'));

    expect(emitted).toBe(false);
  });
});
