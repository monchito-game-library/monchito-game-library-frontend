import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ToggleSwitchComponent } from './toggle-switch.component';

describe('ToggleSwitchComponent', () => {
  let component: ToggleSwitchComponent;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [ToggleSwitchComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    component = fixture.componentInstance;
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

  describe('getIcon', () => {
    it('devuelve el icono por defecto cuando _value es false', () => {
      expect(component.getIcon()).toBe('remove');
    });

    it('devuelve el icono checked por defecto cuando _value es true', () => {
      component.writeValue(true);

      expect(component.getIcon()).toBe('check');
    });
  });

  describe('registerOnTouched', () => {
    it('registra el callback de onTouched', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);
      expect((component as any)._onTouched).toBe(onTouched);
    });
  });

  describe('forwardRef (NG_VALUE_ACCESSOR)', () => {
    it('resuelve el forwardRef al inyectar NG_VALUE_ACCESSOR desde el injector del componente', () => {
      const fixture = TestBed.createComponent(ToggleSwitchComponent);
      const accessor = fixture.componentRef.injector.get(NG_VALUE_ACCESSOR);
      expect(accessor).toBeTruthy();
    });
  });

  describe('ngOnChanges', () => {
    it('actualiza _value cuando cambia checked y no está en modo CVA', () => {
      component.ngOnChanges({ checked: new SimpleChange(false, true, false) });
      expect(component._value()).toBe(true);
    });

    it('no actualiza _value cuando está en modo CVA', () => {
      component.registerOnChange(() => {});
      component.ngOnChanges({ checked: new SimpleChange(false, true, false) });
      expect(component._value()).toBe(false);
    });

    it('actualiza _isDisabled cuando cambia disabled', () => {
      component.ngOnChanges({ disabled: new SimpleChange(false, true, false) });
      expect(component._isDisabled()).toBe(true);
    });

    it('usa false como fallback si checked.currentValue es undefined', () => {
      component.ngOnChanges({ checked: new SimpleChange(true, undefined, false) });
      expect(component._value()).toBe(false);
    });
  });
});
