import { Directive, HostListener, input, InputSignal } from '@angular/core';
import { LibDatepickerComponent } from './lib-datepicker.component';

/**
 * Directiva para el icono que abre/cierra el LibDatepickerComponent.
 * Se aplica al elemento de sufijo (lib-icon o botón) que actúa como toggle.
 *
 * Uso:
 * ```html
 * <retro-icon retroSuffix [retroDatepickerToggle]="picker" name="calendar_today" />
 * <retro-datepicker #picker />
 * ```
 */
@Directive({
  selector: '[retroDatepickerToggle]',
  standalone: true,
  host: {
    style: 'cursor: pointer;'
  }
})
export class LibDatepickerToggleDirective {
  /** Referencia al LibDatepickerComponent que controla. */
  readonly retroDatepickerToggle: InputSignal<LibDatepickerComponent> = input.required<LibDatepickerComponent>();

  /**
   * Abre o cierra el calendario al hacer click.
   */
  @HostListener('click')
  onClick(): void {
    const picker: LibDatepickerComponent = this.retroDatepickerToggle();
    if (picker.isOpen()) {
      picker.close();
    } else {
      picker.open();
    }
  }
}
