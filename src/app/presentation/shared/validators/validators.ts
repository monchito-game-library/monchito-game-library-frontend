import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Shows mat-error as soon as the control is dirty (while typing),
 * without waiting for blur/touched.
 */
export class DirtyErrorStateMatcher implements ErrorStateMatcher {
  /**
   * Returns true when the control is invalid and has been modified (dirty) or blurred (touched).
   *
   * @param {FormControl | null} control - The form control to evaluate.
   * @param {FormGroupDirective | NgForm | null} _form - The parent form (unused).
   */
  isErrorState(control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean {
    return !!(control?.invalid && (control.dirty || control.touched));
  }
}

/**
 * Returns a validator that checks whether the control's value is one of the
 * allowed options. Useful for select fields backed by a fixed set of values.
 *
 * Returns `null` when the value is valid, or `{ invalidOption: true }` when it
 * is not present in the allowed list.
 *
 * @template T - Type of the allowed values.
 * @param {readonly T[]} allowed - List of accepted values.
 *
 * @example
 * formControl.setValidators(selectOneValidator(['PS5', 'PS4', 'SWITCH']));
 */
export function selectOneValidator<T>(allowed: readonly T[]): (control: { value: T }) => null | {
  invalidOption: true;
} {
  return (control) => {
    return allowed.includes(control.value) ? null : { invalidOption: true };
  };
}

/**
 * Validates that the control's value has at most one decimal place (step 0.1).
 * Returns `null` when valid or the value is null, `{ invalidStep: true }` otherwise.
 *
 * @example
 * new FormControl<number | null>(null, ratingStepValidator)
 */
export function ratingStepValidator(control: { value: number | null }): null | { invalidStep: true } {
  const val = control.value;
  if (val === null) return null;
  const decimals = (val.toString().split('.')[1] ?? '').length;
  return decimals <= 1 ? null : { invalidStep: true };
}

/**
 * Validates that the control's value is a valid calendar date (YYYY-MM-DD).
 * Returns `null` when valid or the value is empty, `{ invalidDate: true }` otherwise.
 *
 * @example
 * new FormControl<string | null>(null, validDateValidator)
 */
export function validDateValidator(control: { value: string | null | undefined }): null | { invalidDate: true } {
  const val = control.value;
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return { invalidDate: true };
  const year = d.getUTCFullYear();
  return year >= 1000 && year <= 9999 ? null : { invalidDate: true };
}
