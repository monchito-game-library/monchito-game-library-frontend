import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareListBaseComponent } from '@/abstract/hardware-list-base/hardware-list-base.component';
import { ControllerModel } from '@/models/controller/controller.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { HardwareListShellComponent } from '@/pages/collection/components/hardware-list-shell/hardware-list-shell.component';
import { RetroChipComponent } from '@retro/retro-chip/retro-chip.component';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, HardwareListShellComponent, RetroChipComponent]
})
export class ControllersComponent extends HardwareListBaseComponent<ControllerModel> {
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);

  protected readonly _listRoute = '/collection/controllers/add';
  protected readonly _detailRoute = '/collection/controllers';
  protected readonly _i18nLoadError = 'controllersPage.snack.loadError';
  protected readonly _scrollOffsetSignal = this._userPreferencesState.controllersScrollOffset;

  /** List of controllers owned by the user. */
  readonly items: WritableSignal<ControllerModel[]> = signal<ControllerModel[]>([]);

  /**
   * Flags dinámicos para el retro-command-bar según el estado actual de la lista.
   * Solo visible en desktop >= 1024px (el componente lo oculta por CSS).
   */
  readonly commandFlags: Signal<readonly string[]> = computed((): readonly string[] => {
    const flags: string[] = [];
    if (this.searchQuery()) flags.push(`search="${this.searchQuery()}"`);
    return flags;
  });

  async ngOnInit(): Promise<void> {
    this._initScrollRestoration();
    const userId: string | null = this._userContext.userId();
    if (!userId) return;
    await Promise.all([
      this._loadItems(() => this._controllerUseCases.getAllForUser(userId)),
      this._loadStores(),
      this._loadCatalog('controller')
    ]);
    this._restoreScrollPosition();
  }
}
