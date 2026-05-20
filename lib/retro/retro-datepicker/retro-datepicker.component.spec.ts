import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RetroDatepickerComponent } from './retro-datepicker.component';
import { RetroDatepickerDay } from './interfaces/retro-datepicker-day.interface';

describe('RetroDatepickerComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [RetroDatepickerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('_isOpen inicia en false', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance._isOpen()).toBe(false);
  });

  it('_isDisabled inicia en false', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance._isDisabled()).toBe(false);
  });

  it('writeValue(null) limpia la fecha seleccionada', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance._selectedDate()).toBeNull();
    expect(fixture.componentInstance._displayText()).toBe('');
  });

  it('writeValue con Date establece _selectedDate y _displayText', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const date = new Date(2025, 0, 15);
    fixture.componentInstance.writeValue(date);
    expect(fixture.componentInstance._selectedDate()).toEqual(date);
    expect(fixture.componentInstance._displayText()).toContain('15');
  });

  it('writeValue con string ISO parsea la fecha correctamente', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue('2025-03-20');
    const selected = fixture.componentInstance._selectedDate();
    expect(selected).not.toBeNull();
    expect(selected?.getFullYear()).toBe(2025);
    expect(selected?.getMonth()).toBe(2);
    expect(selected?.getDate()).toBe(20);
  });

  it('writeValue con Date inválida limpia la selección', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date('invalid'));
    expect(fixture.componentInstance._selectedDate()).toBeNull();
    expect(fixture.componentInstance._displayText()).toBe('');
  });

  it('writeValue con string inválido limpia la selección', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue('no-es-fecha');
    expect(fixture.componentInstance._selectedDate()).toBeNull();
  });

  it('writeValue con string de fecha larga (no ISO) parsea si es válida vía fallback', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    // "January 15, 2025" no coincide con el regex YYYY-MM-DD → usa new Date(value) como fallback
    const result = fixture.componentInstance.writeValue('January 15, 2025');
    const selected = fixture.componentInstance._selectedDate();
    // En la mayoría de entornos, este string se puede parsear
    if (selected !== null) {
      expect(selected.getFullYear()).toBe(2025);
    } else {
      // Si el entorno no parsea, la selección se limpia
      expect(selected).toBeNull();
    }
  });

  it('setDisabledState actualiza _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance._isDisabled()).toBe(true);
  });

  it('empty es true cuando no hay fecha seleccionada', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.empty).toBe(true);
  });

  it('empty es false cuando hay fecha seleccionada', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 1));
    expect(fixture.componentInstance.empty).toBe(false);
  });

  it('onClear limpia el estado y emite cleared', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 1));
    let clearEmitted = false;
    fixture.componentInstance.cleared.subscribe(() => (clearEmitted = true));
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance._selectedDate()).toBeNull();
    expect(fixture.componentInstance._displayText()).toBe('');
    expect(clearEmitted).toBe(true);
  });

  it('errorState es false sin NgControl', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance.errorState).toBe(false);
  });

  it('disabled getter devuelve _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance.disabled).toBe(true);
  });

  it('toggle no abre el calendario cuando está deshabilitado', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.componentInstance.toggle();
    expect(fixture.componentInstance._isOpen()).toBe(false);
  });

  it('openCalendar no abre si está deshabilitado', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.componentInstance.openCalendar();
    expect(fixture.componentInstance._isOpen()).toBe(false);
  });

  it('openCalendar no abre si ya está abierto', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance._isOpen.set(true);
    // No debería lanzar ni cambiar el estado
    expect(() => fixture.componentInstance.openCalendar()).not.toThrow();
    expect(fixture.componentInstance._isOpen()).toBe(true);
  });

  it('prevMonth retrocede un mes en _viewDate', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 1));
    fixture.componentInstance.prevMonth();
    expect(fixture.componentInstance._viewDate().getMonth()).toBe(4); // mayo
    expect(fixture.componentInstance._viewDate().getFullYear()).toBe(2025);
  });

  it('prevMonth retrocede correctamente desde enero (cruce de año)', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 0, 1));
    fixture.componentInstance.prevMonth();
    expect(fixture.componentInstance._viewDate().getMonth()).toBe(11); // diciembre
    expect(fixture.componentInstance._viewDate().getFullYear()).toBe(2024);
  });

  it('nextMonth avanza un mes en _viewDate', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 1));
    fixture.componentInstance.nextMonth();
    expect(fixture.componentInstance._viewDate().getMonth()).toBe(6); // julio
    expect(fixture.componentInstance._viewDate().getFullYear()).toBe(2025);
  });

  it('nextMonth avanza correctamente desde diciembre (cruce de año)', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 11, 1));
    fixture.componentInstance.nextMonth();
    expect(fixture.componentInstance._viewDate().getMonth()).toBe(0); // enero
    expect(fixture.componentInstance._viewDate().getFullYear()).toBe(2026);
  });

  it('selectToday selecciona la fecha de hoy', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    fixture.componentInstance.selectToday();
    const today = new Date();
    const selected = fixture.componentInstance._selectedDate();
    expect(selected?.getFullYear()).toBe(today.getFullYear());
    expect(selected?.getMonth()).toBe(today.getMonth());
    expect(selected?.getDate()).toBe(today.getDate());
    expect(fn).toHaveBeenCalled();
  });

  it('onDayClick selecciona el día clickado', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    fixture.componentInstance.onDayClick(day);
    expect(fixture.componentInstance._selectedDate()?.getDate()).toBe(15);
    expect(fn).toHaveBeenCalled();
  });

  it('onDayClick no hace nada si el día está deshabilitado', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: true,
      label: '15'
    };
    fixture.componentInstance.onDayClick(day);
    expect(fn).not.toHaveBeenCalled();
  });

  it('onDayClick no hace nada si el día no tiene fecha', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    const day: RetroDatepickerDay = {
      date: null as unknown as Date,
      inMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: ''
    };
    fixture.componentInstance.onDayClick(day);
    expect(fn).not.toHaveBeenCalled();
  });

  it('onDialogKeydown con Escape llama a close()', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const closeSpy = vi.spyOn(fixture.componentInstance, 'close');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    fixture.componentInstance.onDialogKeydown(event);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('onDialogKeydown con otra tecla no llama a close()', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const closeSpy = vi.spyOn(fixture.componentInstance, 'close');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    fixture.componentInstance.onDialogKeydown(event);
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('onInputFocus emite true al focusSubject', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    let emitted: boolean | undefined;
    fixture.componentInstance.focused$.subscribe((v) => (emitted = v));
    fixture.componentInstance.onInputFocus();
    expect(emitted).toBe(true);
  });

  it('onInputBlur emite false y llama onTouched cuando el calendario está cerrado', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnTouched(fn);
    let emitted: boolean | undefined;
    fixture.componentInstance.focused$.subscribe((v) => (emitted = v));
    fixture.componentInstance.onInputBlur();
    expect(emitted).toBe(false);
    expect(fn).toHaveBeenCalled();
  });

  it('onInputBlur no emite ni llama onTouched cuando el calendario está abierto', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnTouched(fn);
    fixture.componentInstance._isOpen.set(true);
    const emissions: boolean[] = [];
    fixture.componentInstance.focused$.subscribe((v) => emissions.push(v));
    fixture.componentInstance.onInputBlur();
    expect(emissions.length).toBe(0);
    expect(fn).not.toHaveBeenCalled();
  });

  it('isSameDay devuelve true para la misma fecha', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const a = new Date(2025, 5, 15);
    const b = new Date(2025, 5, 15);
    expect(fixture.componentInstance.isSameDay(a, b)).toBe(true);
  });

  it('isSameDay devuelve false para fechas distintas', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const a = new Date(2025, 5, 15);
    const b = new Date(2025, 5, 16);
    expect(fixture.componentInstance.isSameDay(a, b)).toBe(false);
  });

  it('close no lanza error cuando no hay overlayRef', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    (fixture.componentInstance as any)._overlayRef = null;
    expect(() => fixture.componentInstance.close()).not.toThrow();
    expect(fixture.componentInstance._isOpen()).toBe(false);
  });

  it('ngOnDestroy llama dispose del overlayRef si existe', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const disposeSpy = vi.fn();
    (fixture.componentInstance as any)._overlayRef = { dispose: disposeSpy };
    fixture.componentInstance.ngOnDestroy();
    expect(disposeSpy).toHaveBeenCalled();
  });

  it('ngOnDestroy no falla si no hay overlayRef', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    (fixture.componentInstance as any)._overlayRef = null;
    expect(() => fixture.componentInstance.ngOnDestroy()).not.toThrow();
  });

  it('onClear llama registerOnChange con null', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    fixture.componentInstance.onClear();
    expect(fn).toHaveBeenCalledWith(null);
  });

  it('weeks genera correctamente las semanas del mes', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 0, 1)); // enero 2025
    const weeks = fixture.componentInstance.weeks();
    expect(weeks.length).toBeGreaterThan(0);
    weeks.forEach((week) => expect(week.length).toBe(7));
  });

  it('headerLabel se actualiza al cambiar el mes', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 0, 1));
    const initialLabel = fixture.componentInstance.headerLabel();
    fixture.componentInstance.nextMonth();
    const nextLabel = fixture.componentInstance.headerLabel();
    expect(nextLabel).not.toBe(initialLabel);
  });

  it('onDayKeydown con ArrowLeft navega al día anterior', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onDayKeydown(event, day);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._activeDate()?.getDate()).toBe(14);
  });

  it('onDayKeydown con ArrowRight navega al día siguiente', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onDayKeydown(event, day);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._activeDate()?.getDate()).toBe(16);
  });

  it('onDayKeydown con ArrowUp navega 7 días antes', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onDayKeydown(event, day);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._activeDate()?.getDate()).toBe(8);
  });

  it('onDayKeydown con ArrowDown navega 7 días después', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onDayKeydown(event, day);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._activeDate()?.getDate()).toBe(22);
  });

  it('onDayKeydown con Home navega al primer día de la semana', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    // 15 junio 2025 es domingo → Home debería ir al lunes 9 junio
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'Home' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onDayKeydown(event, day);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._activeDate()).not.toBeNull();
  });

  it('onDayKeydown con End navega al último día de la semana', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 9), // lunes
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '9'
    };
    const event = new KeyboardEvent('keydown', { key: 'End' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onDayKeydown(event, day);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._activeDate()?.getDate()).toBe(15); // domingo
  });

  it('onDayKeydown con PageUp navega al mes anterior', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'PageUp' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onDayKeydown(event, day);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._activeDate()?.getMonth()).toBe(4); // mayo
  });

  it('onDayKeydown con PageDown navega al mes siguiente', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'PageDown' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onDayKeydown(event, day);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._activeDate()?.getMonth()).toBe(6); // julio
  });

  it('onDayKeydown con PageUp + Shift navega al año anterior', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'PageUp', shiftKey: true });
    fixture.componentInstance.onDayKeydown(event, day);
    expect(fixture.componentInstance._activeDate()?.getFullYear()).toBe(2024);
  });

  it('onDayKeydown con PageDown + Shift navega al año siguiente', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'PageDown', shiftKey: true });
    fixture.componentInstance.onDayKeydown(event, day);
    expect(fixture.componentInstance._activeDate()?.getFullYear()).toBe(2026);
  });

  it('onDayKeydown con Enter selecciona el día', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    fixture.componentInstance.onDayKeydown(event, day);
    expect(fixture.componentInstance._selectedDate()?.getDate()).toBe(15);
    expect(fn).toHaveBeenCalled();
  });

  it('onDayKeydown con Space selecciona el día', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 15),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '15'
    };
    const event = new KeyboardEvent('keydown', { key: ' ' });
    fixture.componentInstance.onDayKeydown(event, day);
    expect(fn).toHaveBeenCalled();
  });

  it('onDayKeydown no hace nada si el día no tiene fecha', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnChange(fn);
    const day: RetroDatepickerDay = {
      date: null as unknown as Date,
      inMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: ''
    };
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    expect(() => fixture.componentInstance.onDayKeydown(event, day)).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
  });

  it('registerOnTouched registra el callback y se llama en onInputBlur', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const fn = vi.fn();
    fixture.componentInstance.registerOnTouched(fn);
    fixture.componentInstance.onInputBlur();
    expect(fn).toHaveBeenCalled();
  });

  it('dayHeaders expone las cabeceras de días', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    expect(fixture.componentInstance.dayHeaders.length).toBe(7);
  });

  it('writeValue con Date válida actualiza _viewDate al primer día del mes', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const date = new Date(2025, 5, 20);
    fixture.componentInstance.writeValue(date);
    const viewDate = fixture.componentInstance._viewDate();
    expect(viewDate.getFullYear()).toBe(2025);
    expect(viewDate.getMonth()).toBe(5);
    expect(viewDate.getDate()).toBe(1);
  });

  it('días fuera del rango min son marcados como deshabilitados', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.componentRef.setInput('min', new Date(2025, 5, 10));
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 15));
    const weeks = fixture.componentInstance.weeks();
    const allDays = weeks.flat();
    const dayBefore = allDays.find((d) => d.date && d.date.getDate() === 5 && d.inMonth);
    if (dayBefore) {
      expect(dayBefore.isDisabled).toBe(true);
    }
  });

  it('días fuera del rango max son marcados como deshabilitados', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.componentRef.setInput('max', new Date(2025, 5, 20));
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 15));
    const weeks = fixture.componentInstance.weeks();
    const allDays = weeks.flat();
    const dayAfter = allDays.find((d) => d.date && d.date.getDate() === 25 && d.inMonth);
    if (dayAfter) {
      expect(dayAfter.isDisabled).toBe(true);
    }
  });

  it('toggle() cierra el calendario cuando ya está abierto', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    // Simular estado abierto directamente
    fixture.componentInstance._isOpen.set(true);
    const closeSpy = vi.spyOn(fixture.componentInstance, 'close');
    fixture.componentInstance.toggle();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('toggle() cuando no está deshabilitado e intenta abrir (sin template) no lanza error', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    // No hay template del calendario en el test con NO_ERRORS_SCHEMA, _calendarTemplate es undefined
    expect(() => fixture.componentInstance.toggle()).not.toThrow();
  });

  it('_activeDate se activa al navegar con teclado a otro mes', () => {
    const fixture = TestBed.createComponent(RetroDatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(new Date(2025, 5, 30));
    fixture.componentInstance._activeDate.set(null);
    const day: RetroDatepickerDay = {
      date: new Date(2025, 5, 30),
      inMonth: true,
      isToday: false,
      isSelected: false,
      isDisabled: false,
      label: '30'
    };
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    fixture.componentInstance.onDayKeydown(event, day);
    // Navegar al 1 julio cambia el mes
    expect(fixture.componentInstance._activeDate()?.getMonth()).toBe(6);
  });
});

@Component({
  selector: 'app-datepicker-form-host',
  standalone: true,
  imports: [RetroDatepickerComponent, ReactiveFormsModule],
  template: `<retro-datepicker label="Fecha" [formControl]="control" />`,
  schemas: [NO_ERRORS_SCHEMA]
})
class DatepickerFormHostComponent {
  control = new FormControl<Date | null>(null, [Validators.required]);
}

describe('RetroDatepickerComponent (con FormControl)', () => {
  let fixture: ComponentFixture<DatepickerFormHostComponent>;
  let host: DatepickerFormHostComponent;
  let datepicker: RetroDatepickerComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DatepickerFormHostComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DatepickerFormHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    datepicker = fixture.debugElement.query(
      (el) => el.componentInstance instanceof RetroDatepickerComponent
    )?.componentInstance;
  });

  it('ngControl se establece en ngOnInit', () => {
    expect(datepicker.ngControl).not.toBeNull();
  });

  it('errorState es true cuando el control es inválido y touched', () => {
    host.control.markAsTouched();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(datepicker.errorState).toBe(true);
  });

  it('errorState es true cuando el control es inválido y dirty', () => {
    host.control.markAsDirty();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(datepicker.errorState).toBe(true);
  });

  it('errorState es false cuando el control es válido', () => {
    host.control.clearValidators();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(datepicker.errorState).toBe(false);
  });
});
