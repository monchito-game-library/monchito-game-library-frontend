import { RetroOptionComponent } from '../retro-option.component';

/**
 * Contrato que deben implementar los componentes padre de RetroOptionComponent
 * (RetroSelectComponent, RetroAutocompleteComponent) para recibir notificaciones
 * de selección desde las opciones.
 */
export interface RetroOptionParent {
  /**
   * Notifica al padre que el usuario ha seleccionado esta opción.
   *
   * @param {RetroOptionComponent} option - Opción seleccionada.
   */
  selectOption(option: RetroOptionComponent): void;
}
