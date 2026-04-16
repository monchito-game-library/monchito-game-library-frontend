import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ConsoleModel } from '@/models/console/console.model';
import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import {
  HARDWARE_CONSOLE_SPECS_USE_CASES,
  HardwareConsoleSpecsUseCasesContract
} from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases.contract';
import { HardwareLoanItem } from '@/pages/collection/components/hardware-loan-form/hardware-loan-form.component';
import { SaleAvailabilityValues, SaleSoldValues } from '@/interfaces/forms/sale-form.interface';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
import { HardwareDetailBaseComponent } from '@/abstract/hardware-detail-base.component';
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

  /**
   * Saves the console's availability status (forSale + salePrice) via the use case.
   * Passed as the saveFn input to SaleFormComponent.
   *
   * @param {SaleAvailabilityValues} v - Availability values from the form
   */
  readonly consoleSaveFn = async (v: SaleAvailabilityValues): Promise<void> => {
    const c = this.console()!;
    const sale: HardwareSaleStatusModel = {
      forSale: v.forSale,
      salePrice: v.forSale ? v.salePrice : null,
      soldAt: c.soldAt,
      soldPriceFinal: c.soldPriceFinal
    };
    await this._consoleUseCases.updateSaleStatus(this._userContext.requireUserId(), c.id, sale);
  };

  /**
   * Registers the console as sold via the use case.
   * Passed as the sellFn input to SaleFormComponent.
   *
   * @param {SaleSoldValues} v - Sold values from the form
   */
  readonly consoleSellFn = async (v: SaleSoldValues): Promise<void> => {
    const c = this.console()!;
    const sale: HardwareSaleStatusModel = {
      forSale: false,
      salePrice: null,
      soldAt: v.soldAt,
      soldPriceFinal: v.soldPriceFinal
    };
    await this._consoleUseCases.updateSaleStatus(this._userContext.requireUserId(), c.id, sale);
  };

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.paramMap.get('id') ?? '';
    await Promise.all([this._loadConsoleWithCatalog(id), this._loadStores()]);
  }

  /**
   * Returns the UUID of the currently loaded console.
   */
  protected _getItemId(): string | undefined {
    return this.console()?.id;
  }

  /**
   * Called after the sale form saves availability successfully.
   * Updates the console signal with the new forSale/salePrice values and closes the form.
   *
   * @param {SaleAvailabilityValues} values - Updated availability values from the form
   */
  onSaveCompleted(values: SaleAvailabilityValues): void {
    const c = this.console()!;
    this.console.set({ ...c, forSale: values.forSale, salePrice: values.forSale ? values.salePrice : null });
    this.showSaleForm.set(false);
  }

  /**
   * Llamado cuando el formulario de préstamo completa una acción.
   * Actualiza la señal de consola y cierra el formulario.
   *
   * @param {HardwareLoanItem} updated - Modelo con los nuevos valores de préstamo aplicados
   */
  onLoanSaved(updated: HardwareLoanItem): void {
    this.console.set(updated as ConsoleModel);
    this.showLoanForm.set(false);
  }

  /**
   * Elimina la consola mediante el use case específico.
   */
  protected async _deleteItem(): Promise<void> {
    await this._consoleUseCases.delete(this._userContext.requireUserId(), this.console()!.id);
  }

  /**
   * Carga la consola y todos los datos del catálogo asociados (marca, modelo, edición, specs).
   *
   * @param {string} id - UUID de la consola del usuario
   */
  private async _loadConsoleWithCatalog(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const c = await this._consoleUseCases.getById(this._userContext.requireUserId(), id);
      if (!c) {
        this._router.navigate([this._listRoute]);
        return;
      }
      this.console.set(c);

      const [specs] = await Promise.all([
        c.modelId ? this._specsUseCases.getByModelId(c.modelId) : Promise.resolve(undefined),
        this._loadBrandModelEdition(c.brandId, c.modelId, c.editionId)
      ]);

      this.specs.set(specs);
    } catch {
      this._router.navigate([this._listRoute]);
    } finally {
      this.loading.set(false);
    }
  }
}
