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
import { RetroMenuItemComponent } from './components/retro-menu-item/retro-menu-item.component';

/**
 * Panel de menú contextual Terminal Collector.
 * Renderiza una lista con role="menu" y proyecta RetroMenuItemComponent como items.
 * La apertura/cierre se delega a RetroMenuTriggerDirective, que usa el templateRef
 * interno para proyectarlo en el overlay CDK.
 */
@Component({
  selector: 'retro-menu',
  standalone: true,
  imports: [],
  template: `
    <ng-template #menuTemplate>
      <ul class="retro-menu" role="menu" [attr.aria-labelledby]="ariaLabelledBy() || null">
        <ng-content />
      </ul>
    </ng-template>
  `,
  styleUrl: './retro-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroMenuComponent {
  /** ID del elemento que etiqueta este menú para accesibilidad. */
  readonly ariaLabelledBy: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Template del panel de menú, proyectado en el overlay por RetroMenuTriggerDirective. */
  @ViewChild('menuTemplate', { static: true })
  readonly templateRef!: TemplateRef<unknown>;

  /** Items del menú proyectados (accedidos por RetroMenuTriggerDirective para el ListKeyManager). */
  @ContentChildren(RetroMenuItemComponent, { descendants: true })
  readonly menuItems!: QueryList<RetroMenuItemComponent>;
}
