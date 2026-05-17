import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  InputSignal,
  NgZone,
  OutputEmitterRef,
  QueryList,
  Signal,
  WritableSignal,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';
import { LibTabComponent } from './lib-tab.component';

/**
 * Componente de tabs accesible con role="tablist".
 * Implementa el patrón APG de activación automática (arrow keys cambian y activan el tab).
 *
 * Uso:
 * ```html
 * <app-lib-tabs [selectedIndex]="0" (selectedIndexChange)="onTabChange($event)">
 *   <app-lib-tab label="Tab 1" icon="sell">
 *     <ng-template>...contenido...</ng-template>
 *   </app-lib-tab>
 * </app-lib-tabs>
 * ```
 */
@Component({
  selector: 'app-lib-tabs',
  standalone: true,
  imports: [LibIconComponent, NgTemplateOutlet],
  templateUrl: './lib-tabs.component.html',
  styleUrl: './lib-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibTabsComponent {
  private readonly _ngZone: NgZone = inject(NgZone);

  /** Índice del tab seleccionado inicialmente. */
  readonly selectedIndex: InputSignal<number> = input<number>(0);

  /** Etiqueta aria para el tablist. */
  readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Emite el nuevo índice cuando el usuario cambia de tab. */
  readonly selectedIndexChange: OutputEmitterRef<number> = output<number>();

  /** Índice activo interno (controlado por el componente). */
  readonly _activeIndex: WritableSignal<number> = signal<number>(0);

  /** Tabs proyectados como hijos. */
  @ContentChildren(LibTabComponent)
  readonly tabs!: QueryList<LibTabComponent>;

  /** Lista de tabs como array reactivo para el template. */
  readonly tabsArray: Signal<LibTabComponent[]> = computed(() => this.tabs?.toArray() ?? []);

  /**
   * Selecciona un tab por índice, actualiza el estado interno y emite el cambio.
   *
   * @param {number} index - Índice del tab a activar.
   */
  select(index: number): void {
    this._activeIndex.set(index);
    this.selectedIndexChange.emit(index);
  }

  /**
   * Maneja la navegación con teclado dentro del tablist.
   * Implementa el patrón APG de activación automática.
   *
   * @param {KeyboardEvent} event - Evento de teclado.
   * @param {number} currentIndex - Índice del tab que tiene el foco actualmente.
   */
  onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const tabs = this.tabs.toArray();
    const count = tabs.length;
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % count;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + count) % count;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = count - 1;
        break;
      default:
        return;
    }

    this.select(nextIndex);
    this._focusTab(nextIndex);
  }

  /**
   * Mueve el foco DOM al botón del tab en el índice indicado.
   *
   * @param {number} index - Índice del tab a enfocar.
   */
  private _focusTab(index: number): void {
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const btn = document.querySelector<HTMLElement>(`[id="lib-tab-${this.tabs.toArray()[index]?.id}"]`);
        btn?.focus();
      });
    });
  }
}
