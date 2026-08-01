import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { RetroCardComponent } from '@retro/retro-card/retro-card.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { MIN_DESKTOP_WIDTH_PX } from '@/constants/breakpoints.constant';

/**
 * Shell component for the orders section. Renders the active sub-page on
 * desktop/tablet, and an informational message on phones (where the order
 * editor does not fit comfortably).
 */
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TranslocoPipe, RetroCardComponent, RetroIconComponent]
})
export class OrdersComponent {
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  /** True when the viewport is below the minimum desktop width. */
  readonly isMobile: ReturnType<typeof signal<boolean>> = signal<boolean>(this._detectMobile());

  constructor() {
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.isMobile.set(this._detectMobile()));
  }

  private _detectMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < MIN_DESKTOP_WIDTH_PX;
  }
}