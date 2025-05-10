import { AvailableUserInterface } from '../interfaces/available-user.interface';

/**
 * Usuarios disponibles para seleccionar en la app.
 * Estos datos se usan tanto para cargar juegos del usuario como para mostrar su información visual.
 */
export const availableUsers: AvailableUserInterface[] = [
  { id: 'alberto', labelKey: 'users.alberto', image: 'alberto.png' },
  { id: 'rafa', labelKey: 'users.rafa', image: 'rafa.png' },
  { id: 'alen', labelKey: 'users.alen', image: 'alen.png' },
  { id: 'andres', labelKey: 'users.andres', image: 'andres.png' }
];
