import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InputSignal,
  OutputEmitterRef,
  inject,
  input,
  output
} from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';

/**
 * Item individual de un LibMenuComponent.
 * Implementa Highlightable para compatibilidad con CDK ActiveDescendantKeyManager.
 */
@Component({
  selector: 'retro-menu-item',
  standalone: true,
  imports: [LibIconComponent],
  template: `
    <li class="lib-menu-item" role="none">
      <button type="button" role="menuitem" [disabled]="isDisabled() || null" (click)="onClick($event)">
        @if (icon()) {
          <retro-icon [name]="icon()!" class="lib-menu-item__icon" />
        }
        <span class="lib-menu-item__label"><ng-content /></span>
      </button>
    </li>
  `,
  styleUrl: './lib-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibMenuItemComponent implements Highlightable {
  private readonly _el: ElementRef<HTMLElement> = inject(ElementRef);

  /** Nombre del icono Material Icons a mostrar junto al label. */
  readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Deshabilita el item cuando es true. */
  readonly isDisabled: InputSignal<boolean> = input<boolean>(false);

  /** Emite el MouseEvent al hacer clic si no está deshabilitado. */
  readonly clicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

  /**
   * Getter booleano requerido por la interfaz Highlightable del CDK.
   * El ActiveDescendantKeyManager lo usa para saltarse items deshabilitados.
   */
  get disabled(): boolean {
    return this.isDisabled();
  }

  /**
   * Aplica los estilos de estado activo (requerido por Highlightable).
   * El foco visual se gestiona con CSS :focus-visible en el botón interno.
   */
  setActiveStyles(): void {
    this.focus();
  }

  /**
   * Elimina los estilos de estado activo (requerido por Highlightable).
   */
  setInactiveStyles(): void {
    // no-op: el estado inactivo se maneja via CSS
  }

  /**
   * Mueve el foco al botón interno del item.
   * Usado por LibMenuTriggerDirective vía ActiveDescendantKeyManager.
   */
  focus(): void {
    const btn = this._el.nativeElement.querySelector('button');
    btn?.focus();
  }

  /** Getter de texto para el type-ahead del ListKeyManager. */
  getLabel(): string {
    return this._el.nativeElement.textContent?.trim() ?? '';
  }

  /**
   * Maneja el click en el botón del item.
   *
   * @param {MouseEvent} event - Evento de ratón del click.
   */
  onClick(event: MouseEvent): void {
    if (!this.isDisabled()) {
      this.clicked.emit(event);
    }
  }
}
