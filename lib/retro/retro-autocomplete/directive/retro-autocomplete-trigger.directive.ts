import { Directive, ElementRef, HostListener, inject, input, InputSignal, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { RetroAutocompleteComponent } from '../retro-autocomplete.component';

/**
 * Directiva para conectar un <input retroInput> con un RetroAutocompleteComponent.
 * Se encarga de:
 * - Abrir el panel al hacer focus o al teclear.
 * - Navegar opciones con ArrowDown/ArrowUp.
 * - Seleccionar con Enter.
 * - Cerrar con Escape o blur.
 * - Actualizar el valor del FormControl al seleccionar.
 * - Mostrar el texto en el input usando la función displayWith del autocomplete.
 *
 * Uso:
 * ```html
 * <input retroInput type="text" [retroAutocompleteTrigger]="auto" [formControl]="form.controls.platform" />
 * <retro-autocomplete #auto [displayWith]="displayFn">...</retro-autocomplete>
 * ```
 */
@Directive({
  selector: 'input[retroAutocompleteTrigger], textarea[retroAutocompleteTrigger]',
  standalone: true
})
export class RetroAutocompleteTriggerDirective implements OnInit {
  private readonly _elRef: ElementRef<HTMLInputElement> = inject(ElementRef);
  private readonly _ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Referencia al RetroAutocompleteComponent asociado. */
  readonly retroAutocompleteTrigger: InputSignal<RetroAutocompleteComponent> =
    input.required<RetroAutocompleteComponent>();

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Registrar el trigger en el autocomplete.
    this.retroAutocompleteTrigger().registerTrigger(this._elRef);
  }

  // ── Handlers de host ─────────────────────────────────────────────────────────

  /**
   * Abre el panel al hacer focus en el input.
   */
  @HostListener('focus')
  onFocus(): void {
    this.retroAutocompleteTrigger().openPanel();
  }

  /**
   * Abre el panel (o lo mantiene abierto) al escribir.
   */
  @HostListener('input')
  onInput(): void {
    if (!this.retroAutocompleteTrigger().isOpen()) {
      this.retroAutocompleteTrigger().openPanel();
    }
  }

  /**
   * Gestiona la navegación de teclado:
   * - ArrowDown/ArrowUp: navegar opciones.
   * - Enter: seleccionar la opción activa.
   * - Escape: cerrar el panel.
   *
   * @param {KeyboardEvent} event - Evento de teclado.
   */
  @HostListener('keydown', ['$event'])
  onKeydown(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    const ac: RetroAutocompleteComponent = this.retroAutocompleteTrigger();
    const key: string = keyEvent.key;

    if (key === 'ArrowDown') {
      event.preventDefault();
      ac.moveActive(1);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      ac.moveActive(-1);
    } else if (key === 'Enter') {
      if (ac.isOpen()) {
        event.preventDefault();
        ac.selectActive();
      }
    } else if (key === 'Escape') {
      if (ac.isOpen()) {
        event.preventDefault();
        ac.closePanel();
      }
    }
  }

  /**
   * Cuando el autocomplete emite una selección, actualiza el formControl
   * y muestra el texto con displayWith en el input nativo.
   * Este método es llamado por el componente padre via subscription a (optionSelected).
   * El enlace se hace en el template con (optionSelected)="onOptionSelected($event)".
   *
   * En la arquitectura actual, el componente padre (ej. game-form) se suscribe
   * al output `optionSelected` del autocomplete y actualiza el FormControl y el
   * texto del input manualmente — igual que con mat-autocomplete.
   *
   * Para mayor ergonomía, la directiva también expone el método `handleSelected`
   * que puede llamarse desde el output binding del template.
   *
   * @param {unknown} value - Valor seleccionado.
   */
  handleSelected(value: unknown): void {
    const displayFn: ((v: any) => string) | null = this.retroAutocompleteTrigger().displayWith();
    if (displayFn) {
      this._elRef.nativeElement.value = displayFn(value);
    }
    if (this._ngControl?.control) {
      this._ngControl.control.setValue(value);
    }
  }
}
