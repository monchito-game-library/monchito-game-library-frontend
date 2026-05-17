import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RetroCheckboxComponent } from './retro-checkbox.component';

describe('RetroCheckboxComponent', () => {
  let component: RetroCheckboxComponent;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [RetroCheckboxComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(RetroCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('writeValue (CVA)', () => {
    it('establece _value a true', () => {
      component.writeValue(true);

      expect(component._value()).toBe(true);
    });

    it('establece _value a false', () => {
      component.writeValue(true);
      component.writeValue(false);

      expect(component._value()).toBe(false);
    });

    it('usa false como fallback cuando el valor es null', () => {
      component.writeValue(null as unknown as boolean);

      expect(component._value()).toBe(false);
    });
  });

  describe('registerOnChange', () => {
    it('activa el modo CVA (_cvaMode = true)', () => {
      component.registerOnChange(() => {});

      expect((component as any)._cvaMode).toBe(true);
    });
  });

  describe('setDisabledState', () => {
    it('establece _isDisabled a true', () => {
      component.setDisabledState(true);

      expect(component._isDisabled()).toBe(true);
    });

    it('establece _isDisabled a false', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);

      expect(component._isDisabled()).toBe(false);
    });
  });

  describe('onToggle', () => {
    it('invierte _value de false a true', () => {
      component.onToggle();

      expect(component._value()).toBe(true);
    });

    it('invierte _value de true a false', () => {
      component.writeValue(true);
      component.onToggle();

      expect(component._value()).toBe(false);
    });

    it('llama al callback de onChange con el nuevo valor', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      component.onToggle();

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('emite el evento changed con el nuevo valor', () => {
      const emitted: boolean[] = [];
      component.changed.subscribe((v: boolean) => emitted.push(v));

      component.onToggle();

      expect(emitted).toEqual([true]);
    });

    it('no hace nada cuando está desactivado', () => {
      component.setDisabledState(true);
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      component.onToggle();

      expect(component._value()).toBe(false);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('registerOnTouched', () => {
    it('registra el callback de onTouched', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);
      // Verificamos invocación indirecta: llamar onToggle dispara onTouched
      component.onToggle();
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('forwardRef (NG_VALUE_ACCESSOR)', () => {
    it('resuelve el forwardRef al inyectar NG_VALUE_ACCESSOR desde el injector del componente', () => {
      const fixture = TestBed.createComponent(RetroCheckboxComponent);
      const accessor = fixture.componentRef.injector.get(NG_VALUE_ACCESSOR);
      expect(accessor).toBeTruthy();
    });
  });

  describe('defaults', () => {
    it('renderiza con checked=false por defecto', () => {
      expect(component._value()).toBe(false);
    });

    it('renderiza con size="md" por defecto', () => {
      expect(component.size()).toBe('md');
    });

    it('renderiza sin label por defecto', () => {
      expect(component.label()).toBeUndefined();
    });

    it('renderiza con disabled=false por defecto', () => {
      expect(component._isDisabled()).toBe(false);
    });
  });
});
