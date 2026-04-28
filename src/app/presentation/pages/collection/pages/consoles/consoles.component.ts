import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareListBaseComponent } from '@/abstract/hardware-list-base/hardware-list-base.component';
import { ConsoleModel } from '@/models/console/console.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import { HardwareListShellComponent } from '@/pages/collection/components/hardware-list-shell/hardware-list-shell.component';
import { BadgeChipComponent } from '@/components/ad-hoc/badge-chip/badge-chip.component';
import { ConsoleSpecsCategoryType } from '@/types/console-specs-category.type';

@Component({
  selector: 'app-consoles',
  templateUrl: './consoles.component.html',
  styleUrls: ['./consoles.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, HardwareListShellComponent, BadgeChipComponent]
})
export class ConsolesComponent extends HardwareListBaseComponent<ConsoleModel> {
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);

  protected readonly _listRoute = '/collection/consoles/add';
  protected readonly _detailRoute = '/collection/consoles';
  protected readonly _i18nLoadError = 'consolesPage.snack.loadError';
  protected readonly _scrollOffsetSignal = this._userPreferencesState.consolesScrollOffset;

  /** List of consoles owned by the user. */
  readonly items: WritableSignal<ConsoleModel[]> = signal<ConsoleModel[]>([]);

  /**
   * Returns the console category ('home', 'portable', 'hybrid') for a given model UUID.
   * Used by the card header template to pick the correct icon.
   *
   * @param {string | null} modelId - Hardware model UUID
   */
  resolveCategory(modelId: string | null): ConsoleSpecsCategoryType | null {
    if (!modelId) return null;
    const model: HardwareModelModel | undefined = this._hardwareModels().find(
      (m: HardwareModelModel): boolean => m.id === modelId
    );
    return model?.category ?? null;
  }

  async ngOnInit(): Promise<void> {
    this._initScrollRestoration();
    const userId: string | null = this._userContext.userId();
    if (!userId) return;
    await Promise.all([
      this._loadItems(() => this._consoleUseCases.getAllForUser(userId)),
      this._loadStores(),
      this._loadCatalog('console')
    ]);
    this._restoreScrollPosition();
  }
}
