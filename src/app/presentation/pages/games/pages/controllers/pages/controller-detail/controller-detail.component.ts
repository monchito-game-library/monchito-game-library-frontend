import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ControllerModel } from '@/models/controller/controller.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { StoreModel } from '@/models/store/store.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
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
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import {
  HardwareLoanFormComponent,
  HardwareLoanItem
} from '@/components/hardware-loan-form/hardware-loan-form.component';
import {
  HardwareSaleFormComponent,
  HardwareSaleItem
} from '@/components/hardware-sale-form/hardware-sale-form.component';

@Component({
  selector: 'app-controller-detail',
  templateUrl: './controller-detail.component.html',
  styleUrl: './controller-detail.component.scss',
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
    HardwareSaleFormComponent
  ]
})
export class ControllerDetailComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  private readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  private readonly _editionUseCases: HardwareEditionUseCasesContract = inject(HARDWARE_EDITION_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  private _stores: StoreModel[] = [];

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** True while data is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** The user's controller entry. */
  readonly controller: WritableSignal<ControllerModel | undefined> = signal<ControllerModel | undefined>(undefined);

  /** Brand from the catalog. */
  readonly brand: WritableSignal<HardwareBrandModel | undefined> = signal<HardwareBrandModel | undefined>(undefined);

  /** Model from the catalog. */
  readonly model: WritableSignal<HardwareModelModel | undefined> = signal<HardwareModelModel | undefined>(undefined);

  /** Edition from the catalog, if any. */
  readonly edition: WritableSignal<HardwareEditionModel | undefined> = signal<HardwareEditionModel | undefined>(
    undefined
  );

  /** Whether the sale form view is active. */
  readonly showSaleForm: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the loan form view is active. */
  readonly showLoanForm: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether a delete operation is in progress. */
  readonly deleting: WritableSignal<boolean> = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.paramMap.get('id') ?? '';
    await Promise.all([this._loadControllerWithCatalog(id), this._loadStores()]);
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
   * Navega de vuelta a la lista de mandos.
   */
  onBack(): void {
    this._router.navigate(['/games/controllers']);
  }

  /**
   * Navega al formulario de edición del mando actual.
   */
  onEdit(): void {
    const c = this.controller();
    if (c) this._router.navigate(['/games/controllers/edit', c.id]);
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
   * Llamado cuando el formulario de venta guarda correctamente.
   * Si el mando fue vendido, navega a la lista; si no, actualiza la señal.
   *
   * @param {ControllerModel} updated - Modelo con los nuevos valores de venta aplicados
   */
  onSaleSaved(updated: HardwareSaleItem): void {
    const model = updated as ControllerModel;
    if (model.soldAt) {
      void this._router.navigate(['/games/controllers']);
      return;
    }
    this.controller.set(model);
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
   * Muestra un diálogo de confirmación y elimina el mando si el usuario confirma.
   * Tras eliminar, redirige a la lista de mandos.
   */
  onDelete(): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('controllersPage.deleteDialog.title'),
        message: this._transloco.translate('controllersPage.deleteDialog.message')
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      const c = this.controller();
      if (!c) return;
      this.deleting.set(true);
      try {
        await this._controllerUseCases.delete(this._userContext.requireUserId(), c.id);
        this._snackBar.open(
          this._transloco.translate('controllersPage.snack.deleted'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
        this._router.navigate(['/games/controllers']);
      } catch {
        this._snackBar.open(
          this._transloco.translate('controllersPage.snack.deleteError'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
        this.deleting.set(false);
      }
    });
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
        this._router.navigate(['/games/controllers']);
        return;
      }
      this.controller.set(c);

      const [brand, model, edition] = await Promise.all([
        c.brandId ? this._brandUseCases.getById(c.brandId) : Promise.resolve(undefined),
        c.modelId ? this._modelUseCases.getById(c.modelId) : Promise.resolve(undefined),
        c.editionId ? this._editionUseCases.getById(c.editionId) : Promise.resolve(undefined)
      ]);

      this.brand.set(brand);
      this.model.set(model);
      this.edition.set(edition);
    } catch {
      this._router.navigate(['/games/controllers']);
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
      // Fallo silencioso
    }
  }
}
