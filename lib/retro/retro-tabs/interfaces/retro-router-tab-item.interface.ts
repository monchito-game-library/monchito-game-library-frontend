/** Definición de un item de navegación por rutas para RetroRouterTabsComponent. */
export interface LibRouterTabItemInterface {
  /** Ruta a la que navega el link. */
  readonly path: string;
  /** Texto del label del link (clave de transloco). */
  readonly label: string;
  /** Nombre del icono Material Icons (opcional). */
  readonly icon?: string;
  /** Si se requiere coincidencia exacta de ruta para marcar el link como activo. */
  readonly exact?: boolean;
}
