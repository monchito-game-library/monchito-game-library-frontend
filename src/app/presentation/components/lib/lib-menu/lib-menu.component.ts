import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  InputSignal,
  QueryList,
  TemplateRef,
  ViewChild,
  input
} from '@angular/core';
import { LibMenuItemComponent } from './lib-menu-item.component';

/**
 * Panel de menú contextual Terminal Collector.
 * Renderiza una lista con role="menu" y proyecta LibMenuItemComponent como items.
 * La apertura/cierre se delega a LibMenuTriggerDirective, que usa el templateRef
 * interno para proyectarlo en el overlay CDK.
 */
@Component({
  selector: 'retro-menu',
  standalone: true,
  imports: [],
  template: `
    <ng-template #menuTemplate>
      <ul class="lib-menu" role="menu" [attr.aria-labelledby]="ariaLabelledBy() || null">
        <ng-content />
      </ul>
    </ng-template>
  `,
  styleUrl: './lib-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibMenuComponent {
  /** ID del elemento que etiqueta este menú para accesibilidad. */
  readonly ariaLabelledBy: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Template del panel de menú, proyectado en el overlay por LibMenuTriggerDirective. */
  @ViewChild('menuTemplate', { static: true })
  readonly templateRef!: TemplateRef<unknown>;

  /** Items del menú proyectados (accedidos por LibMenuTriggerDirective para el ListKeyManager). */
  @ContentChildren(LibMenuItemComponent, { descendants: true })
  readonly menuItems!: QueryList<LibMenuItemComponent>;
}
