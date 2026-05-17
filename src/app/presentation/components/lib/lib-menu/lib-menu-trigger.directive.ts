import {
  Directive,
  ElementRef,
  HostListener,
  InputSignal,
  OnDestroy,
  ViewContainerRef,
  inject,
  input,
  signal
} from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { LIB_MENU_POSITIONS } from '@/constants/lib-menu-positions.constant';
import { LibMenuComponent } from './lib-menu.component';
import { LibMenuItemComponent } from './lib-menu-item.component';

/**
 * Directiva que convierte cualquier elemento en el disparador de un LibMenuComponent.
 * Gestiona apertura/cierre del overlay CDK, navegación con teclado y atributos a11y.
 *
 * Uso: `<button [retroMenuTriggerFor]="miMenu">...</button>`
 */
@Directive({
  selector: '[retroMenuTriggerFor]',
  standalone: true,
  host: {
    '[attr.aria-haspopup]': '"menu"',
    '[attr.aria-expanded]': '_isOpen()'
  }
})
export class LibMenuTriggerDirective implements OnDestroy {
  private readonly _el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _overlay: Overlay = inject(Overlay);
  private readonly _vcr: ViewContainerRef = inject(ViewContainerRef);

  private _overlayRef: OverlayRef | null = null;
  private _keyManager: ActiveDescendantKeyManager<LibMenuItemComponent> | null = null;

  /** Referencia al LibMenuComponent que este trigger va a abrir. */
  readonly retroMenuTriggerFor: InputSignal<LibMenuComponent> = input.required<LibMenuComponent>();

  /** Estado de apertura del menú (reactivo para aria-expanded). */
  readonly _isOpen = signal<boolean>(false);

  ngOnDestroy(): void {
    this._closeMenu();
    this._overlayRef?.dispose();
  }

  /**
   * Abre o cierra el menú al hacer click en el elemento trigger.
   *
   * @param {MouseEvent} event - Evento de ratón.
   */
  @HostListener('click', ['$event'])
  onTriggerClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this._isOpen()) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  /**
   * Gestiona teclas cuando el trigger tiene el foco.
   *
   * @param {KeyboardEvent} event - Evento de teclado.
   */
  @HostListener('keydown', ['$event'])
  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this._isOpen()) {
        this._openMenu();
        setTimeout(() => this._keyManager?.setFirstItemActive(), 50);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this._isOpen()) {
        this._openMenu();
        setTimeout(() => this._keyManager?.setLastItemActive(), 50);
      }
    }
  }

  /**
   * Abre el overlay con el template del LibMenuComponent anclado al trigger.
   */
  private _openMenu(): void {
    const menuComponent = this.retroMenuTriggerFor();
    if (!menuComponent?.templateRef) {
      return;
    }

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._el.nativeElement)
      .withPositions(LIB_MENU_POSITIONS)
      .withPush(true);

    this._overlayRef = this._overlay.create(
      new OverlayConfig({
        hasBackdrop: true,
        backdropClass: 'lib-overlay-backdrop--transparent',
        panelClass: 'lib-overlay-panel--menu',
        scrollStrategy: this._overlay.scrollStrategies.reposition(),
        positionStrategy,
        disposeOnNavigation: true
      })
    );

    const portal = new TemplatePortal(menuComponent.templateRef, this._vcr);
    this._overlayRef.attach(portal);
    this._isOpen.set(true);

    this._overlayRef.backdropClick().subscribe(() => this._closeMenu());

    this._overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      this._handleMenuKeydown(event);
    });

    this._setupKeyManager();
  }

  /**
   * Cierra el overlay del menú y restaura el foco al trigger.
   */
  private _closeMenu(): void {
    if (!this._overlayRef) {
      return;
    }
    this._overlayRef.detach();
    this._isOpen.set(false);
    this._keyManager = null;
    this._el.nativeElement.focus();
  }

  /**
   * Configura el ListKeyManager para navegación con teclado dentro del menú.
   */
  private _setupKeyManager(): void {
    const menuComponent = this.retroMenuTriggerFor();
    if (!menuComponent?.menuItems) {
      return;
    }

    const items = menuComponent.menuItems.toArray();
    this._keyManager = new ActiveDescendantKeyManager<LibMenuItemComponent>(items).withWrap().withTypeAhead();
  }

  /**
   * Maneja los eventos de teclado dentro del panel del menú.
   *
   * @param {KeyboardEvent} event - Evento de teclado capturado en el overlay.
   */
  private _handleMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this._closeMenu();
      return;
    }

    if (event.key === 'Tab') {
      this._closeMenu();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const active = this._keyManager?.activeItem;
      if (active) {
        active.onClick(new MouseEvent('click'));
        this._closeMenu();
      }
      return;
    }

    this._keyManager?.onKeydown(event);
    const activeItem = this._keyManager?.activeItem;
    if (activeItem) {
      activeItem.focus();
    }
  }
}
