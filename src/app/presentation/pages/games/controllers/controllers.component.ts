import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ControllerModel } from '@/models/controller/controller.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
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
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GAME_CONDITION } from '@/constants/game-condition.constant';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButton,
    MatFabButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatChipsModule,
    TranslocoPipe
  ]
})
export class ControllersComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  private readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  private readonly _stores: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);
  private readonly _brands: WritableSignal<HardwareBrandModel[]> = signal<HardwareBrandModel[]>([]);
  private readonly _hardwareModels: WritableSignal<HardwareModelModel[]> = signal<HardwareModelModel[]>([]);

  /** Condition constant exposed to the template for comparisons. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** List of controllers owned by the user. */
  readonly controllers: WritableSignal<ControllerModel[]> = signal<ControllerModel[]>([]);

  /** True while the initial data load is in progress. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    await Promise.all([this._loadControllers(), this._loadStores(), this._loadCatalog()]);
  }

  /**
   * Devuelve el nombre de la tienda a partir de su UUID.
   * Si no se encuentra, devuelve el propio id (fallback para datos legacy).
   *
   * @param {string | null} id - UUID de la tienda
   */
  resolveStoreName(id: string | null): string {
    if (!id) return '';
    const store: StoreModel | undefined = this._stores().find((s: StoreModel): boolean => s.id === id);
    return store?.label ?? id;
  }

  /**
   * Devuelve el nombre de la marca a partir de su UUID.
   *
   * @param {string | null} id - UUID de la marca
   */
  resolveBrandName(id: string | null): string {
    if (!id) return '—';
    return this._brands().find((b: HardwareBrandModel): boolean => b.id === id)?.name ?? '—';
  }

  /**
   * Devuelve el nombre del modelo a partir de su UUID.
   *
   * @param {string | null} id - UUID del modelo
   */
  resolveModelName(id: string | null): string {
    if (!id) return '—';
    return this._hardwareModels().find((m: HardwareModelModel): boolean => m.id === id)?.name ?? '—';
  }

  /**
   * Navega al formulario de creación de mando.
   */
  onAdd(): void {
    this._router.navigate(['/games/controllers/add']);
  }

  /**
   * Navega al formulario de edición del mando indicado.
   *
   * @param {ControllerModel} controller - El mando a editar
   */
  onEdit(controller: ControllerModel): void {
    this._router.navigate(['/games/controllers/edit', controller.id]);
  }

  /**
   * Opens a confirmation dialog and deletes the controller if confirmed.
   *
   * @param {ControllerModel} controller - The controller to delete
   */
  onDelete(controller: ControllerModel): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('controllersPage.deleteDialog.title'),
        message: this._transloco.translate('controllersPage.deleteDialog.message')
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      try {
        await this._controllerUseCases.delete(this._userContext.requireUserId(), controller.id);
        this.controllers.update((list) => list.filter((c) => c.id !== controller.id));
        this._snackBar.open(
          this._transloco.translate('controllersPage.snack.deleted'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
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
   * Carga marcas y modelos de mando del catálogo para resolver nombres en la lista.
   */
  private async _loadCatalog(): Promise<void> {
    try {
      const [brands, models] = await Promise.all([
        this._brandUseCases.getAll(),
        this._modelUseCases.getAllByType('controller')
      ]);
      this._brands.set(brands);
      this._hardwareModels.set(models);
    } catch {
      // Fallo silencioso: los nombres mostrarán '—'
    }
  }

  /**
   * Carga la lista de tiendas disponibles desde Supabase.
   */
  private async _loadStores(): Promise<void> {
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this._stores.set(stores);
    } catch {
      // Fallo silencioso
    }
  }

  /**
   * Carga todos los mandos del usuario desde el caso de uso.
   */
  private async _loadControllers(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this._controllerUseCases.getAllForUser(this._userContext.requireUserId());
      this.controllers.set(data);
    } catch {
      this._snackBar.open(
        this._transloco.translate('controllersPage.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.loading.set(false);
    }
  }
}
