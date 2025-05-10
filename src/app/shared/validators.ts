/**
 * Crea un validador para formularios que verifica si el valor del control
 * pertenece a una lista permitida de opciones.
 *
 * @template T Tipo de los valores válidos.
 * @param allowed Lista de valores permitidos.
 * @returns Función validadora que devuelve `null` si el valor es válido, o `{ invalidOption: true }` si no lo es.
 *
 * @example
 * formControl.setValidators(oneOf(['PS5', 'PS4', 'SWITCH']));
 */
export function selectOneValidator<T>(allowed: readonly T[]): (control: { value: T }) => null | {
  invalidOption: true;
} {
  return (control) => {
    return allowed.includes(control.value) ? null : { invalidOption: true };
  };
}
