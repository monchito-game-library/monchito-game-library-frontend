import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Componente de mensaje de error para campos de formulario Terminal Collector.
 * Se proyecta dentro de LibFormFieldComponent y sólo se muestra cuando
 * el campo es inválido y ha sido tocado.
 *
 * Uso:
 * ```html
 * @if (form.controls.email.hasError('required')) {
 *   <app-lib-error>El email es requerido</app-lib-error>
 * }
 * ```
 */
@Component({
  selector: 'app-lib-error',
  standalone: true,
  imports: [],
  template: `<span class="lib-error" role="alert"><ng-content /></span>`,
  styleUrl: './lib-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibErrorComponent {}
