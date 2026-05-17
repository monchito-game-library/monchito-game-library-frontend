import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { RetroIconComponent } from '@/components/retro/retro-icon/retro-icon.component';
import { LibRouterTabItemInterface } from '@/interfaces/retro-router-tab-item.interface';

/**
 * Componente de navegación por rutas con estética de tabs Terminal Collector.
 * Genera un `<nav>` con `<a routerLink>` + `aria-current="page"` en el activo.
 * No necesita panels — el `<router-outlet>` es el contenido.
 *
 * Uso:
 * ```html
 * <retro-router-tabs [items]="navItems" ariaLabel="Navegación colección" />
 * ```
 */
@Component({
  selector: 'retro-router-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, RetroIconComponent, TranslocoPipe],
  templateUrl: './retro-router-tabs.component.html',
  styleUrl: './retro-router-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroRouterTabsComponent {
  /** Listado de items de navegación (labels son claves de transloco). */
  readonly items: InputSignal<readonly LibRouterTabItemInterface[]> =
    input.required<readonly LibRouterTabItemInterface[]>();

  /** Etiqueta aria para el elemento nav. */
  readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
}
