import { Directive, ElementRef, HostListener, inject, input, InputSignal } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';

/**
 * Abre el datepicker solo cuando el click ocurre dentro del wrapper del campo
 * (outline + label + input), ignorando clicks en el subscript (hints y errors).
 *
 * Uso: <mat-form-field [appDatepickerFieldClick]="pickerRef">
 */
@Directive({
  selector: 'mat-form-field[appDatepickerFieldClick]',
  standalone: true
})
export class DatepickerFieldClickDirective {
  private readonly _el: ElementRef<HTMLElement> = inject(ElementRef);

  /** Referencia al datepicker que debe abrirse al hacer click en el campo. */
  readonly appDatepickerFieldClick: InputSignal<MatDatepicker<Date>> = input.required<MatDatepicker<Date>>();

  /**
   * Abre el datepicker si el click se originó dentro del wrapper visual del campo,
   * ignorando clicks en el área de subscript (hints y errors).
   *
   * @param {MouseEvent} event - Evento de click del host
   */
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const wrapper: Element | null = this._el.nativeElement.querySelector('.mat-mdc-text-field-wrapper');
    if (wrapper?.contains(event.target as Node)) {
      this.appDatepickerFieldClick().open();
    }
  }
}
