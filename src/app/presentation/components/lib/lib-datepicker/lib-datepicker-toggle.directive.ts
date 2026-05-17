import { Directive, HostListener, input, InputSignal } from '@angular/core';
import { LibDatepickerComponent } from './lib-datepicker.component';

/**
 * Directiva para el icono que abre/cierra el LibDatepickerComponent.
 * Se aplica al elemento de sufijo (lib-icon o botón) que actúa como toggle.
 *
 * Uso:
 * ```html
 * <app-lib-icon libSuffix [libDatepickerToggle]="picker" name="calendar_today" />
 * <app-lib-datepicker #picker />
 * ```
 */
@Directive({
  selector: '[libDatepickerToggle]',
  standalone: true,
  host: {
    style: 'cursor: pointer;'
  }
})
export class LibDatepickerToggleDirective {
  /** Referencia al LibDatepickerComponent que controla. */
  readonly libDatepickerToggle: InputSignal<LibDatepickerComponent> = input.required<LibDatepickerComponent>();

  /**
   * Abre o cierra el calendario al hacer click.
   */
  @HostListener('click')
  onClick(): void {
    const picker: LibDatepickerComponent = this.libDatepickerToggle();
    if (picker.isOpen()) {
      picker.close();
    } else {
      picker.open();
    }
  }
}
