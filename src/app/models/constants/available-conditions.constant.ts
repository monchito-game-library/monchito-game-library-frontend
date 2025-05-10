import { AvailableConditionInterface } from '../interfaces/available-condition.interface';

/**
 * Lista de condiciones disponibles para un videojuego.
 * Se utiliza en el formulario para seleccionar si es nuevo o de segunda mano.
 */
export const availableConditions: AvailableConditionInterface[] = [
  { code: 'New', labelKey: 'gameForm.conditions.new' },
  { code: 'Used', labelKey: 'gameForm.conditions.used' }
];
