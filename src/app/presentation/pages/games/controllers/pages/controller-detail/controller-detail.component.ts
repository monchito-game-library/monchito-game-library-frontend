import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
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

@Component({
  selector: 'app-controller-detail',
  templateUrl: './controller-detail.component.html',
  styleUrl: './controller-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatIconButton, MatIcon, MatProgressSpinner, MatChipsModule, TranslocoPipe]
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
