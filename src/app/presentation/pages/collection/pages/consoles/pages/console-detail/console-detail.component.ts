import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ConsoleModel } from '@/models/console/console.model';
import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import {
  HARDWARE_CONSOLE_SPECS_USE_CASES,
  HardwareConsoleSpecsUseCasesContract
} from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases.contract';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
import { HardwareDetailBaseComponent } from '@/abstract/hardware-detail-base/hardware-detail-base.component';
import { HardwareItemModel } from '@/types/hardware-item.type';
import { HardwareDetailShellComponent } from '@/pages/collection/components/hardware-detail-shell/hardware-detail-shell.component';

@Component({
  selector: 'app-console-detail',
  templateUrl: './console-detail.component.html',
  styleUrl: './console-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, HardwareDetailShellComponent]
})
export class ConsoleDetailComponent extends HardwareDetailBaseComponent {
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);
  private readonly _specsUseCases: HardwareConsoleSpecsUseCasesContract = inject(HARDWARE_CONSOLE_SPECS_USE_CASES);

  /** The user's console entry. */
  readonly console: WritableSignal<ConsoleModel | undefined> = signal<ConsoleModel | undefined>(undefined);

  /** Technical specs from the catalog. */
  readonly specs: WritableSignal<HardwareConsoleSpecsModel | undefined> = signal<HardwareConsoleSpecsModel | undefined>(
    undefined
  );

  protected readonly _listRoute = '/collection/consoles';
  protected readonly _editRoute = '/collection/consoles/edit';
  protected readonly _i18nDeleteTitle = 'consolesPage.deleteDialog.title';
  protected readonly _i18nDeleteMessage = 'consolesPage.deleteDialog.message';
  protected readonly _i18nDeletedSnack = 'consolesPage.snack.deleted';
  protected readonly _i18nDeleteErrorSnack = 'consolesPage.snack.deleteError';

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.paramMap.get('id') ?? '';
    await Promise.all([this._loadItemWithCatalog(id), this._loadStores()]);
  }

  /**
   * Returns the currently loaded console entity.
   */
  protected _getItem(): ConsoleModel | undefined {
    return this.console();
  }

  /**
   * Updates the console signal with the new entity value.
   *
   * @param {HardwareItemModel} item - The new console entity value
   */
  protected _setItem(item: HardwareItemModel): void {
    this.console.set(item as ConsoleModel);
  }

  /**
   * Fetches a console by user and entity UUID from the use case.
   *
   * @param {string} userId - The authenticated user UUID
   * @param {string} id - The console UUID to fetch
   */
  protected async _fetchItem(userId: string, id: string): Promise<ConsoleModel | null | undefined> {
    return this._consoleUseCases.getById(userId, id);
  }

  /**
   * Updates the console sale status via the use case.
   *
   * @param {string} userId - The authenticated user UUID
   * @param {string} id - The console UUID
   * @param {HardwareSaleStatusModel} sale - The new sale status payload
   */
  protected async _updateSaleStatus(userId: string, id: string, sale: HardwareSaleStatusModel): Promise<void> {
    await this._consoleUseCases.updateSaleStatus(userId, id, sale);
  }

  /**
   * Deletes the console via the use case.
   */
  protected async _deleteItem(): Promise<void> {
    await this._consoleUseCases.delete(this._userContext.requireUserId(), this.console()!.id);
  }

  /**
   * Loads the technical specs for the console after the item is set.
   * Overrides the base no-op hook.
   *
   * @param {HardwareItemModel} item - The loaded console entity
   */
  protected override async _afterItemLoaded(item: HardwareItemModel): Promise<void> {
    const console = item as ConsoleModel;
    const specs = await (console.modelId
      ? this._specsUseCases.getByModelId(console.modelId)
      : Promise.resolve(undefined));
    this.specs.set(specs);
  }
}
