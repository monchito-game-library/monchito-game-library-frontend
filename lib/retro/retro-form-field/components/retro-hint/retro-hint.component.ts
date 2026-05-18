import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Componente de texto de ayuda (hint) para campos de formulario Terminal Collector.
 * Se proyecta dentro de RetroFormFieldComponent y sólo se muestra cuando
 * el campo es válido (o no ha sido tocado todavía).
 *
 * Uso:
 * ```html
 * <retro-hint>Introduce el precio en euros</retro-hint>
 * ```
 */
@Component({
  selector: 'retro-hint',
  standalone: true,
  imports: [],
  template: `<span class="retro-hint"><ng-content /></span>`,
  styleUrl: './retro-hint.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroHintComponent {}
