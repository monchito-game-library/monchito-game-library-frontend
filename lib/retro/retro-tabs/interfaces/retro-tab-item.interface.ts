/** Definición de un item de navegación por rutas para retro-tabs en modo router. */
export interface RetroTabItem {
  /** Ruta a la que navega el link. */
  readonly path: string;
  /** Texto del label (clave de transloco). */
  readonly label: string;
  /** Nombre del icono Material Icons (opcional). */
  readonly icon?: string;
  /** Si se requiere coincidencia exacta de ruta para marcar como activo. */
  readonly exact?: boolean;
}
