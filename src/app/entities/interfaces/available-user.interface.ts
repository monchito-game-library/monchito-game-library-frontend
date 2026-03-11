/**
 * Modelo de usuario seleccionable para la aplicación.
 * Cada usuario tiene un ID único, una clave de traducción y una imagen asociada.
 */
export interface AvailableUserInterface {
  /**
   * ID interno del usuario (clave única usada como `userId`)
   */
  id: string;

  /**
   * Clave Transloco para mostrar el nombre del usuario
   */
  labelKey: string;

  /**
   * Nombre del archivo de imagen de perfil (ruta relativa a /assets/images/user-profile)
   */
  image: string;
}
