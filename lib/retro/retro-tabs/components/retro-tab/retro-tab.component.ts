import { ChangeDetectionStrategy, Component, ContentChild, InputSignal, TemplateRef, input } from '@angular/core';

/**
 * Tab individual para RetroTabsComponent.
 * El contenido debe pasarse envuelto en un `<ng-template>`:
 *
 * ```html
 * <retro-tab label="Mi Tab" icon="home">
 *   <ng-template>...contenido...</ng-template>
 * </retro-tab>
 * ```
 */
@Component({
  selector: 'retro-tab',
  standalone: true,
  imports: [],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroTabComponent {
  /** Texto del label del tab. */
  readonly label: InputSignal<string> = input.required<string>();

  /** Nombre del icono Material Icons a mostrar junto al label (opcional). */
  readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** ID único para esta instancia, usado en aria-controls y aria-labelledby. */
  readonly id: string = Math.random().toString(36).slice(2, 9);

  /** Template del contenido del tab, proyectado con <ng-template> por el consumidor. */
  @ContentChild(TemplateRef, { static: false })
  template!: TemplateRef<unknown>;
}
