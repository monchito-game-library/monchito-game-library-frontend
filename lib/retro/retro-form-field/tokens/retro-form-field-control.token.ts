import { InjectionToken } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Observable } from 'rxjs';

/**
 * Contrato que debe implementar cualquier control proyectado dentro de
 * RetroFormFieldComponent (input, select, search, datepicker...).
 *
 * Permite a retro-form-field descubrir el control hijo sin depender
 * de una clase concreta, habilitando la extensión con nuevos controles.
 */
export interface RetroFormFieldControl {
  /** Emite true cuando el control recibe el foco, false cuando lo pierde. */
  focused$: Observable<boolean>;

  /** Verdadero cuando el control tiene un error de validación visible. */
  errorState: boolean;

  /** Verdadero cuando el control está deshabilitado. */
  disabled: boolean;

  /** Verdadero cuando el valor del control está vacío. */
  empty: boolean;

  /**
   * NgControl asociado al control (si existe).
   * Opcional — los controles self-contained lo exponen para que RetroFormFieldComponent
   * pueda observar statusChanges sin hacer cast.
   */
  ngControl?: NgControl | null;
}

/**
 * Token de inyección que los inner controls (RetroInputDirective,
 * RetroSelectComponent, etc.) proveen para anunciarse al
 * RetroFormFieldComponent padre.
 */
export const RETRO_FORM_FIELD_CONTROL = new InjectionToken<RetroFormFieldControl>('RetroFormFieldControl');
