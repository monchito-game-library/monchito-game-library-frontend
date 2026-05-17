import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';

/**
 * Directiva aplicada a un <input> o <textarea> nativo para integrarlo
 * con LibFormFieldComponent.
 *
 * Responsabilidades:
 * - Añade la clase CSS `lib-input__control` al host.
 * - Emite focus/blur al LibFormFieldComponent padre vía `focusChange$`.
 * - Expone el NgControl del host (si existe) para que el form-field
 *   pueda observar el estado de validación.
 * - Genera un id único en el elemento si no tiene uno, para vincular el label.
 * - Aplica `aria-invalid` reactivamente a través del form-field.
 *
 * Uso:
 * ```html
 * <input retroInput formControlName="email" type="email" />
 * <textarea retroInput formControlName="notes" rows="3"></textarea>
 * ```
 */
@Directive({
  selector: 'input[retroInput], textarea[retroInput]',
  standalone: true,
  host: {
    class: 'lib-input__control'
  }
})
export class LibInputDirective {
  /** NgControl del elemento host (null si no hay formControlName/ngModel). */
  readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /** Emite true al recibir foco, false al perderlo. */
  readonly focusChange$: Subject<boolean> = new Subject<boolean>();

  /** Maneja el evento focus del host. */
  @HostListener('focus')
  onFocus(): void {
    this.focusChange$.next(true);
  }

  /** Maneja el evento blur del host — marca el control como touched (estándar Angular). */
  @HostListener('blur')
  onBlur(): void {
    this.focusChange$.next(false);
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
  }
}
