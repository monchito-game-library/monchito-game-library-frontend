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
import { StoreModel } from '@/models/store/store.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
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
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  private readonly _stores: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);

  /** Condition constant exposed to the template for comparisons. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** List of controllers owned by the user. */
  readonly controllers: WritableSignal<ControllerModel[]> = signal<ControllerModel[]>([]);

  /** True while the initial data load is in progress. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    await Promise.all([this._loadControllers(), this._loadStores()]);
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
   * Loads all controllers for the current user from the use-case.
   */
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
