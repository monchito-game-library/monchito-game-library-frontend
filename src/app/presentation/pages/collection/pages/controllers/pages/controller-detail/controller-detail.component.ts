import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ControllerModel } from '@/models/controller/controller.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
import { HardwareDetailBaseComponent } from '@/abstract/hardware-detail-base/hardware-detail-base.component';
import { HardwareItemModel } from '@/types/hardware-item.type';
import { HardwareDetailShellComponent } from '@/pages/collection/components/hardware-detail-shell/hardware-detail-shell.component';
import { BadgeChipComponent } from '@/components/ad-hoc/badge-chip/badge-chip.component';

@Component({
  selector: 'app-controller-detail',
  templateUrl: './controller-detail.component.html',
  styleUrl: './controller-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, HardwareDetailShellComponent, BadgeChipComponent]
})
export class ControllerDetailComponent extends HardwareDetailBaseComponent {
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);

  /** The user's controller entry. */
  readonly controller: WritableSignal<ControllerModel | undefined> = signal<ControllerModel | undefined>(undefined);

  protected readonly _listRoute = '/collection/controllers';
  protected readonly _editRoute = '/collection/controllers/edit';
  protected readonly _i18nDeleteTitle = 'controllersPage.deleteDialog.title';
  protected readonly _i18nDeleteMessage = 'controllersPage.deleteDialog.message';
  protected readonly _i18nDeletedSnack = 'controllersPage.snack.deleted';
  protected readonly _i18nDeleteErrorSnack = 'controllersPage.snack.deleteError';

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.paramMap.get('id') ?? '';
    await Promise.all([this._loadItemWithCatalog(id), this._loadStores()]);
  }

  /**
   * Returns the currently loaded controller entity.
   */
  protected _getItem(): ControllerModel | undefined {
    return this.controller();
  }

  /**
   * Updates the controller signal with the new entity value.
   *
   * @param {HardwareItemModel} item - The new controller entity value
   */
  protected _setItem(item: HardwareItemModel): void {
    this.controller.set(item as ControllerModel);
  }

  /**
   * Fetches a controller by user and entity UUID from the use case.
   *
   * @param {string} userId - The authenticated user UUID
   * @param {string} id - The controller UUID to fetch
   */
  protected async _fetchItem(userId: string, id: string): Promise<ControllerModel | null | undefined> {
    return this._controllerUseCases.getById(userId, id);
  }

  /**
   * Updates the controller sale status via the use case.
   *
   * @param {string} userId - The authenticated user UUID
   * @param {string} id - The controller UUID
   * @param {HardwareSaleStatusModel} sale - The new sale status payload
   */
  protected async _updateSaleStatus(userId: string, id: string, sale: HardwareSaleStatusModel): Promise<void> {
    await this._controllerUseCases.updateSaleStatus(userId, id, sale);
  }

  /**
   * Deletes the controller via the use case.
   */
  protected async _deleteItem(): Promise<void> {
    await this._controllerUseCases.delete(this._userContext.requireUserId(), this.controller()!.id);
  }
}
