import { LibOptionComponent } from '@/components/lib/lib-select/lib-option.component';

/**
 * Contrato que deben implementar los componentes padre de LibOptionComponent
 * (LibSelectComponent, LibAutocompleteComponent) para recibir notificaciones
 * de selección desde las opciones.
 */
export interface LibOptionParent {
  /**
   * Notifica al padre que el usuario ha seleccionado esta opción.
   *
   * @param {LibOptionComponent} option - Opción seleccionada.
   */
  selectOption(option: LibOptionComponent): void;
}
