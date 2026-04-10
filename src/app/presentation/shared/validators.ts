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
