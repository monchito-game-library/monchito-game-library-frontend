import { Directive, HostListener, input, InputSignal } from '@angular/core';
import { RetroDatepickerComponent } from './retro-datepicker.component';

/**
 * Directiva para el icono que abre/cierra el RetroDatepickerComponent.
 * Se aplica al elemento de sufijo (retro-icon o botón) que actúa como toggle.
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
export class RetroDatepickerToggleDirective {
  /** Referencia al RetroDatepickerComponent que controla. */
  readonly retroDatepickerToggle: InputSignal<RetroDatepickerComponent> = input.required<RetroDatepickerComponent>();

  /**
   * Abre o cierra el calendario al hacer click.
   */
  @HostListener('click')
  onClick(): void {
    const picker: RetroDatepickerComponent = this.retroDatepickerToggle();
    if (picker.isOpen()) {
      picker.close();
    } else {
      picker.open();
    }
  }
}
