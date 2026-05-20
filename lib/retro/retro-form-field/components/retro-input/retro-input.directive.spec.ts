import { Component, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RetroInputDirective } from './retro-input.directive';

@Component({
  standalone: true,
  imports: [RetroInputDirective],
  template: `<input retroInput type="text" />`
})
class TestHostComponent {}

@Component({
  standalone: true,
  imports: [RetroInputDirective, ReactiveFormsModule],
  template: `<input retroInput type="text" [formControl]="control" />`
})
class TestHostWithControlComponent {
  control = new FormControl<string>('', { validators: [Validators.required] });
}

describe('RetroInputDirective', () => {
  let de: DebugElement;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    de = fixture.debugElement.query(By.directive(RetroInputDirective));
  });

  it('añade la clase retro-input__control al host', () => {
    expect(de.nativeElement.classList).toContain('retro-input__control');
  });

  it('emite true en focusChange$ al recibir focus', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    let emitted: boolean | undefined;
    directive.focusChange$.subscribe((v) => (emitted = v));

    de.nativeElement.dispatchEvent(new FocusEvent('focus'));

    expect(emitted).toBe(true);
  });

  it('emite false en focusChange$ al perder el foco (blur)', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    let emitted: boolean | undefined;
    directive.focusChange$.subscribe((v) => (emitted = v));

    de.nativeElement.dispatchEvent(new FocusEvent('blur'));

    expect(emitted).toBe(false);
  });

  it('errorState es false sin ngControl', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    expect(directive.errorState).toBe(false);
  });

  it('disabled es false sin ngControl', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    expect(directive.disabled).toBe(false);
  });

  it('empty es true sin ngControl (value undefined)', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    expect(directive.empty).toBe(true);
  });
});

describe('RetroInputDirective (con FormControl)', () => {
  let de: DebugElement;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TestHostWithControlComponent]
    });
    const fixture = TestBed.createComponent(TestHostWithControlComponent);
    fixture.detectChanges();
    de = fixture.debugElement.query(By.directive(RetroInputDirective));
  });

  it('errorState es true cuando el control es inválido y tocado', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    const ctrl = directive.ngControl?.control!;
    ctrl.markAsTouched();
    ctrl.updateValueAndValidity();
    expect(directive.errorState).toBe(true);
  });

  it('disabled es true cuando el control está deshabilitado', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    directive.ngControl?.control?.disable();
    expect(directive.disabled).toBe(true);
  });

  it('empty es false cuando el control tiene valor', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    directive.ngControl?.control?.setValue('algo');
    expect(directive.empty).toBe(false);
  });

  it('onBlur marca el control como touched cuando hay ngControl', () => {
    const directive: RetroInputDirective = de.injector.get(RetroInputDirective);
    const ctrl = directive.ngControl?.control!;
    expect(ctrl.touched).toBe(false);
    de.nativeElement.dispatchEvent(new FocusEvent('blur'));
    expect(ctrl.touched).toBe(true);
  });
});
