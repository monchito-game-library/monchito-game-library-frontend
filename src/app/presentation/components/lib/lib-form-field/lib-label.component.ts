import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

/**
 * Label de campo de formulario Terminal Collector.
 * Renderiza un <label> con estética mono uppercase —
 * siempre encima del campo (sin floating animation).
 *
 * Uso:
 * ```html
 * <app-lib-label [for]="inputId">Título</app-lib-label>
 * <app-lib-label [required]="true">Email</app-lib-label>
 * ```
 */
@Component({
  selector: 'app-lib-label',
  standalone: true,
  imports: [],
  template: `
    <label class="lib-label" [attr.for]="for() || null">
      <ng-content />
      @if (required()) {
        <span class="lib-label__required" aria-hidden="true">*</span>
      }
    </label>
  `,
  styleUrl: './lib-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibLabelComponent {
  /** ID del input al que apunta este label. */
  readonly for: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Muestra el asterisco de campo requerido. */
  readonly required: InputSignal<boolean> = input<boolean>(false);
}
