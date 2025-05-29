/**
 * Estructura esperada para mostrar un diálogo de confirmación.
 * Se utiliza como `data` al abrir `MatDialog`.
 */
export interface ConfirmDialogInterface {
  /**
   * Título que aparece en la parte superior del diálogo
   */
  title: string;

  /**
   * Mensaje principal que describe la acción a confirmar
   */
  message: string;
}
