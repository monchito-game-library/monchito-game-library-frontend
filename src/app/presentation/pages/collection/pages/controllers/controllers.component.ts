import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { HardwareListBaseComponent } from '@/abstract/hardware-list-base.component';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { ControllerModel } from '@/models/controller/controller.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { ListPageHeaderComponent } from '@/pages/collection/components/list-page-header/list-page-header.component';

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
    MatIcon,
    MatProgressSpinner,
    TranslocoPipe,
    SkeletonComponent,
    ListPageHeaderComponent
  ]
})
export class ControllersComponent extends HardwareListBaseComponent {
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  protected readonly _listRoute = '/collection/controllers/add';
  protected readonly _detailRoute = '/collection/controllers';

  /** List of controllers owned by the user. */
  readonly controllers: WritableSignal<ControllerModel[]> = signal<ControllerModel[]>([]);

  /** Controllers filtered by searchQuery against model name and brand name. */
  readonly filteredControllers: Signal<ControllerModel[]> = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.controllers();
    return this.controllers().filter((c: ControllerModel) => {
      const modelName = this._hardwareModels().find((m: HardwareModelModel) => m.id === c.modelId)?.name ?? '';
      const brandName = this._brands().find((b: HardwareBrandModel) => b.id === c.brandId)?.name ?? '';
      return modelName.toLowerCase().includes(q) || brandName.toLowerCase().includes(q);
    });
  });

  /** Sum of prices for all filtered controllers. */
  readonly totalSpent: Signal<number> = computed((): number =>
    this.filteredControllers().reduce((acc: number, c: ControllerModel): number => acc + (c.price ?? 0), 0)
  );

  async ngOnInit(): Promise<void> {
    await Promise.all([this._loadControllers(), this._loadStores(), this._loadCatalog('controller')]);
  }

  /**
   * Navigates to the detail screen for the given controller.
   *
   * @param {ControllerModel} controller - Controller to display
   */
  onDetail(controller: ControllerModel): void {
    this._router.navigate([this._detailRoute, controller.id]);
  }

  /**
   * Loads all controllers for the current user from the use-case.
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
