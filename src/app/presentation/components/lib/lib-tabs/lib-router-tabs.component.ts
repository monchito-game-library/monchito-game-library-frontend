import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';
import { LibRouterTabItemInterface } from '@/interfaces/lib-router-tab-item.interface';

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
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LibIconComponent, TranslocoPipe],
  templateUrl: './lib-router-tabs.component.html',
  styleUrl: './lib-router-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibRouterTabsComponent {
  /** Listado de items de navegación (labels son claves de transloco). */
  readonly items: InputSignal<readonly LibRouterTabItemInterface[]> =
    input.required<readonly LibRouterTabItemInterface[]>();

  /** Etiqueta aria para el elemento nav. */
  readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
}
