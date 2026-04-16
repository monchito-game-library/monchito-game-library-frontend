import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ControllerModel } from '@/models/controller/controller.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { HardwareLoanItem } from '@/pages/collection/components/hardware-loan-form/hardware-loan-form.component';
import { SaleAvailabilityValues, SaleSoldValues } from '@/interfaces/forms/sale-form.interface';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
import { HardwareDetailBaseComponent } from '@/abstract/hardware-detail-base.component';
import { HardwareDetailShellComponent } from '@/pages/collection/components/hardware-detail-shell/hardware-detail-shell.component';

@Component({
  selector: 'app-controller-detail',
  templateUrl: './controller-detail.component.html',
  styleUrl: './controller-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, HardwareDetailShellComponent]
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

  /**
   * Saves the controller's availability status (forSale + salePrice) via the use case.
   * Passed as the saveFn input to SaleFormComponent.
   *
   * @param {SaleAvailabilityValues} v - Availability values from the form
   */
  readonly controllerSaveFn = async (v: SaleAvailabilityValues): Promise<void> => {
    const c = this.controller()!;
    const sale: HardwareSaleStatusModel = {
      forSale: v.forSale,
      salePrice: v.forSale ? v.salePrice : null,
      soldAt: c.soldAt,
      soldPriceFinal: c.soldPriceFinal
    };
    await this._controllerUseCases.updateSaleStatus(this._userContext.requireUserId(), c.id, sale);
  };

  /**
   * Registers the controller as sold via the use case.
   * Passed as the sellFn input to SaleFormComponent.
   *
   * @param {SaleSoldValues} v - Sold values from the form
   */
  readonly controllerSellFn = async (v: SaleSoldValues): Promise<void> => {
    const c = this.controller()!;
    const sale: HardwareSaleStatusModel = {
      forSale: false,
      salePrice: null,
      soldAt: v.soldAt,
      soldPriceFinal: v.soldPriceFinal
    };
    await this._controllerUseCases.updateSaleStatus(this._userContext.requireUserId(), c.id, sale);
  };

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.paramMap.get('id') ?? '';
    await Promise.all([this._loadControllerWithCatalog(id), this._loadStores()]);
  }

  /**
   * Returns the UUID of the currently loaded controller.
   */
  protected _getItemId(): string | undefined {
    return this.controller()?.id;
  }

  /**
   * Called after the sale form saves availability successfully.
   * Updates the controller signal with the new forSale/salePrice values and closes the form.
   *
   * @param {SaleAvailabilityValues} values - Updated availability values from the form
   */
  onSaveCompleted(values: SaleAvailabilityValues): void {
    const c = this.controller()!;
    this.controller.set({ ...c, forSale: values.forSale, salePrice: values.forSale ? values.salePrice : null });
    this.showSaleForm.set(false);
  }

  /**
   * Llamado cuando el formulario de préstamo completa una acción.
   * Actualiza la señal de mando y cierra el formulario.
   *
   * @param {HardwareLoanItem} updated - Modelo con los nuevos valores de préstamo aplicados
   */
  onLoanSaved(updated: HardwareLoanItem): void {
    this.controller.set(updated as ControllerModel);
    this.showLoanForm.set(false);
  }

  /**
   * Elimina el mando mediante el use case específico.
   */
  protected async _deleteItem(): Promise<void> {
    await this._controllerUseCases.delete(this._userContext.requireUserId(), this.controller()!.id);
  }

  /**
   * Carga el mando y los datos del catálogo asociados (marca, modelo, edición).
   *
   * @param {string} id - UUID del mando del usuario
   */
  private async _loadControllerWithCatalog(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const c = await this._controllerUseCases.getById(this._userContext.requireUserId(), id);
      if (!c) {
        this._router.navigate([this._listRoute]);
        return;
      }
      this.controller.set(c);
      await this._loadBrandModelEdition(c.brandId, c.modelId, c.editionId);
    } catch {
      this._router.navigate([this._listRoute]);
    } finally {
      this.loading.set(false);
    }
  }
}
