import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Componente de mensaje de error para campos de formulario Terminal Collector.
 * Se proyecta dentro de RetroFormFieldComponent y sólo se muestra cuando
 * el campo es inválido y ha sido tocado.
 *
 * Uso:
 * ```html
 * @if (form.controls.email.hasError('required')) {
 *   <retro-error>El email es requerido</retro-error>
 * }
 * ```
 */
@Component({
  selector: 'retro-error',
  standalone: true,
  imports: [],
  template: `<span class="retro-error" role="alert"><ng-content /></span>`,
  styleUrl: './retro-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroErrorComponent {}
