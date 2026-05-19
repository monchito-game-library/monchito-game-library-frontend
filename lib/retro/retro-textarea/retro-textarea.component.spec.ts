import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroTextareaComponent } from './retro-textarea.component';

describe('RetroTextareaComponent', () => {
  let fixture: ComponentFixture<RetroTextareaComponent>;
  let component: RetroTextareaComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroTextareaComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(RetroTextareaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test label');
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('isDisabled inicia en false', () => {
    expect(component.isDisabled()).toBe(false);
  });

  it('renderiza un elemento textarea en el DOM', () => {
    const textarea: HTMLTextAreaElement | null = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('rows default es 3 y se proyecta como atributo rows al textarea', () => {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.getAttribute('rows')).toBe('3');
  });

  it('rows input se proyecta como atributo rows al textarea', () => {
    fixture.componentRef.setInput('rows', 6);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.getAttribute('rows')).toBe('6');
  });

  it('resize default "vertical" se aplica como style.resize al textarea', () => {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.style.resize).toBe('vertical');
  });

  it('resize input "none" se aplica como style.resize al textarea', () => {
    fixture.componentRef.setInput('resize', 'none');
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.style.resize).toBe('none');
  });

  it('writeValue actualiza displayValue', () => {
    component.writeValue('hola mundo');
    expect(component.displayValue()).toBe('hola mundo');
  });

  it('writeValue con null limpia displayValue', () => {
    component.writeValue(null);
    expect(component.displayValue()).toBe('');
  });

  it('setDisabledState actualiza isDisabled', () => {
    component.setDisabledState(true);
    expect(component.isDisabled()).toBe(true);
  });

  it('empty es true cuando no hay valor', () => {
    component.writeValue('');
    expect(component.empty).toBe(true);
  });

  it('empty es false cuando hay valor', () => {
    component.writeValue('algo');
    expect(component.empty).toBe(false);
  });

  it('onClear limpia el valor y emite cleared', () => {
    component.writeValue('valor previo');
    let clearEmitted = false;
    component.cleared.subscribe(() => (clearEmitted = true));
    component.onClear();
    expect(component.displayValue()).toBe('');
    expect(clearEmitted).toBe(true);
  });

  it('errorState es false sin NgControl', () => {
    expect(component.errorState).toBe(false);
  });

  it('disabled getter refleja el estado de isDisabled', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it('placeholder se aplica al textarea nativo', () => {
    fixture.componentRef.setInput('placeholder', 'Escribe aquí');
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.placeholder).toBe('Escribe aquí');
  });

  it('maxlength se aplica al textarea nativo como attr.maxlength', () => {
    fixture.componentRef.setInput('maxlength', 200);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.getAttribute('maxlength')).toBe('200');
  });

  it('readonly se aplica al textarea nativo', () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.readOnly).toBe(true);
  });

  it('onInput propaga el valor al CVA callback', () => {
    let capturedValue: string | null = undefined!;
    component.registerOnChange((v: string | null) => {
      capturedValue = v;
    });

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.value = 'nuevo texto';
    textarea.dispatchEvent(new Event('input'));

    expect(capturedValue).toBe('nuevo texto');
  });

  it('onInput con valor vacío emite null al CVA callback', () => {
    let capturedValue: string | null = undefined!;
    component.registerOnChange((v: string | null) => {
      capturedValue = v;
    });

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));

    expect(capturedValue).toBeNull();
  });

  it('blur emite el output blur', () => {
    let blurEmitted = false;
    component.blur.subscribe(() => (blurEmitted = true));
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.dispatchEvent(new FocusEvent('blur'));
    expect(blurEmitted).toBe(true);
  });

  it('focus emite el output focus', () => {
    let focusEmitted = false;
    component.focus.subscribe(() => (focusEmitted = true));
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.dispatchEvent(new FocusEvent('focus'));
    expect(focusEmitted).toBe(true);
  });
});
