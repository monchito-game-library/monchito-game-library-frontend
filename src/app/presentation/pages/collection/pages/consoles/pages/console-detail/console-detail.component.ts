import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ConsoleModel } from '@/models/console/console.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import { StoreModel } from '@/models/store/store.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import {
  HARDWARE_BRAND_USE_CASES,
  HardwareBrandUseCasesContract
} from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import {
  HARDWARE_MODEL_USE_CASES,
  HardwareModelUseCasesContract
} from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import {
  HARDWARE_EDITION_USE_CASES,
  HardwareEditionUseCasesContract
} from '@/domain/use-cases/hardware-edition/hardware-edition.use-cases.contract';
import {
  HARDWARE_CONSOLE_SPECS_USE_CASES,
  HardwareConsoleSpecsUseCasesContract
} from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import {
  HardwareLoanFormComponent,
  HardwareLoanItem
} from '@/components/hardware-loan-form/hardware-loan-form.component';
import { SaleFormComponent } from '@/pages/collection/components/sale-form/sale-form.component';
import { SaleAvailabilityValues, SaleSoldValues } from '@/interfaces/forms/sale-form.interface';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';

@Component({
  selector: 'app-console-detail',
  templateUrl: './console-detail.component.html',
  styleUrl: './console-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatIconButton,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    TranslocoPipe,
    HardwareLoanFormComponent,
    SaleFormComponent
  ]
})
export class ConsoleDetailComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  private readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  private readonly _editionUseCases: HardwareEditionUseCasesContract = inject(HARDWARE_EDITION_USE_CASES);
  private readonly _specsUseCases: HardwareConsoleSpecsUseCasesContract = inject(HARDWARE_CONSOLE_SPECS_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  private _stores: StoreModel[] = [];

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** True while data is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** The user's console entry. */
  readonly console: WritableSignal<ConsoleModel | undefined> = signal<ConsoleModel | undefined>(undefined);

  /** Brand from the catalog. */
  readonly brand: WritableSignal<HardwareBrandModel | undefined> = signal<HardwareBrandModel | undefined>(undefined);

  /** Model from the catalog. */
  readonly model: WritableSignal<HardwareModelModel | undefined> = signal<HardwareModelModel | undefined>(undefined);

  /** Edition from the catalog, if any. */
  readonly edition: WritableSignal<HardwareEditionModel | undefined> = signal<HardwareEditionModel | undefined>(
    undefined
  );

  /** Technical specs from the catalog. */
  readonly specs: WritableSignal<HardwareConsoleSpecsModel | undefined> = signal<HardwareConsoleSpecsModel | undefined>(
    undefined
  );

  /** Whether the sale form view is active. */
  readonly showSaleForm: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the loan form view is active. */
  readonly showLoanForm: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether a delete operation is in progress. */
  readonly deleting: WritableSignal<boolean> = signal<boolean>(false);

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
   * Devuelve la etiqueta de la tienda a partir de su UUID.
   *
   * @param {string | null} id - UUID de la tienda
   */
  resolveStoreName(id: string | null): string {
    if (!id) return '';
    return this._stores.find((s: StoreModel): boolean => s.id === id)?.label ?? id;
  }

  /**
   * Navega de vuelta a la lista de consolas.
   */
  onBack(): void {
    this._router.navigate(['/collection/consoles']);
  }

  /**
   * Navega al formulario de edición de la consola actual.
   */
  onEdit(): void {
    const c = this.console();
    if (c) this._router.navigate(['/collection/consoles/edit', c.id]);
  }

  /**
   * Activa la vista del formulario de venta.
   */
  openSaleView(): void {
    this.showLoanForm.set(false);
    this.showSaleForm.set(true);
  }

  /**
   * Cierra la vista del formulario de venta.
   */
  closeSaleView(): void {
    this.showSaleForm.set(false);
  }

  /**
   * Activa la vista del formulario de préstamo.
   */
  openLoanView(): void {
    this.showSaleForm.set(false);
    this.showLoanForm.set(true);
  }

  /**
   * Cierra la vista del formulario de préstamo.
   */
  closeLoanView(): void {
    this.showLoanForm.set(false);
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
   * Called after the sale form registers the console as sold.
   * Navigates to the consoles list since the console is no longer in the active collection.
   */
  onSellCompleted(): void {
    void this._router.navigate(['/collection/consoles']);
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
   * Muestra un diálogo de confirmación y elimina la consola si el usuario confirma.
   * Tras eliminar, redirige a la lista de consolas.
   */
  onDelete(): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('consolesPage.deleteDialog.title'),
        message: this._transloco.translate('consolesPage.deleteDialog.message')
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      const c = this.console();
      if (!c) return;
      this.deleting.set(true);
      try {
        await this._consoleUseCases.delete(this._userContext.requireUserId(), c.id);
        this._snackBar.open(
          this._transloco.translate('consolesPage.snack.deleted'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
        this._router.navigate(['/collection/consoles']);
      } catch {
        this._snackBar.open(
          this._transloco.translate('consolesPage.snack.deleteError'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
        this.deleting.set(false);
      }
    });
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
        this._router.navigate(['/collection/consoles']);
        return;
      }
      this.console.set(c);

      const [brand, model, edition, specs] = await Promise.all([
        c.brandId ? this._brandUseCases.getById(c.brandId) : Promise.resolve(undefined),
        c.modelId ? this._modelUseCases.getById(c.modelId) : Promise.resolve(undefined),
        c.editionId ? this._editionUseCases.getById(c.editionId) : Promise.resolve(undefined),
        c.modelId ? this._specsUseCases.getByModelId(c.modelId) : Promise.resolve(undefined)
      ]);

      this.brand.set(brand);
      this.model.set(model);
      this.edition.set(edition);
      this.specs.set(specs);
    } catch {
      this._router.navigate(['/collection/consoles']);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Carga las tiendas para resolver el nombre en pantalla.
   */
  private async _loadStores(): Promise<void> {
    try {
      this._stores = await this._storeUseCases.getAllStores();
    } catch {
      // Silent failure
    }
  }
}
