import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { RetroTabsComponent } from '@retro/retro-tabs/retro-tabs.component';
import { RetroTabItem } from '@retro/retro-tabs/interfaces/retro-tab-item.interface';
import { BREAKPOINTS } from '@/constants/breakpoints.constant';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RetroTabsComponent, RouterOutlet]
})
export class CollectionComponent implements OnInit, OnDestroy {
  // ── Inyecciones privadas ───────────────────────────────────────────────────
  private readonly _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  // ── Variables privadas ────────────────────────────────────────────────────
  private _bpSubscription?: Subscription;

  // ── Signals públicos ──────────────────────────────────────────────────────

  /** True cuando el viewport es ≤ 768px (móvil). Oculta los labels de los tabs. */
  readonly isMobile: WritableSignal<boolean> = signal<boolean>(false);

  /** Items de navegación de la colección para retro-tabs en modo router. */
  readonly navItems: readonly RetroTabItem[] = [
    { path: '/collection', label: 'collectionOverview.tabOverview', icon: 'home', exact: true },
    { path: '/collection/games', label: 'collectionOverview.tabGames', icon: 'sports_esports' },
    { path: '/collection/consoles', label: 'collectionOverview.tabConsoles', icon: 'tv' },
    { path: '/collection/controllers', label: 'collectionOverview.tabControllers', icon: 'gamepad' }
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this._bpSubscription = this._breakpointObserver
      .observe([`(max-width: ${BREAKPOINTS.mobile}px)`])
      .subscribe((state): void => {
        this.isMobile.set(state.matches);
      });
  }

  ngOnDestroy(): void {
    this._bpSubscription?.unsubscribe();
  }
}