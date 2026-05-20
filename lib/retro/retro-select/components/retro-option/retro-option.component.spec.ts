import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RetroOptionComponent } from './retro-option.component';
import { RetroSelectComponent } from '../../retro-select.component';
import { ReactiveFormsModule } from '@angular/forms';

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

  it('setActive(true) actualiza active signal', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.detectChanges();
    fixture.componentInstance.setActive(true);
    expect(fixture.componentInstance.active()).toBe(true);
  });

  it('isDisabled() devuelve false por defecto', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.detectChanges();
    expect(fixture.componentInstance.isDisabled()).toBe(false);
  });

  it('isDisabled() devuelve true cuando disabled=true', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.isDisabled()).toBe(true);
  });

  it('onClick() no llama a _parent.selectOption cuando la opción está disabled', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const mockParent = { selectOption: vi.fn() };
    (fixture.componentInstance as any)._parent = mockParent;
    fixture.componentInstance.onClick();
    expect(mockParent.selectOption).not.toHaveBeenCalled();
  });

  it('onClick() llama a _parent.selectOption cuando la opción no está disabled', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.detectChanges();
    const mockParent = { selectOption: vi.fn() };
    (fixture.componentInstance as any)._parent = mockParent;
    fixture.componentInstance.onClick();
    expect(mockParent.selectOption).toHaveBeenCalledWith(fixture.componentInstance);
  });

  it('onClick() no lanza error cuando no hay _parent', () => {
    const fixture = TestBed.createComponent(RetroOptionComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.detectChanges();
    (fixture.componentInstance as any)._parent = null;
    expect(() => fixture.componentInstance.onClick()).not.toThrow();
  });
});
