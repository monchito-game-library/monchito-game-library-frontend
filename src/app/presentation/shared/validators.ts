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
