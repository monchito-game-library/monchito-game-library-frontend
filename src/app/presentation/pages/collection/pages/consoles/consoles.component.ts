import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { HardwareListBaseComponent } from '@/abstract/hardware-list-base.component';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { ConsoleModel } from '@/models/console/console.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import { ListPageHeaderComponent } from '@/pages/collection/components/list-page-header/list-page-header.component';

@Component({
  selector: 'app-consoles',
  templateUrl: './consoles.component.html',
  styleUrls: ['./consoles.component.scss'],
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
export class ConsolesComponent extends HardwareListBaseComponent {
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  protected readonly _listRoute = '/collection/consoles/add';
  protected readonly _detailRoute = '/collection/consoles';

  /** List of consoles owned by the user. */
  readonly consoles: WritableSignal<ConsoleModel[]> = signal<ConsoleModel[]>([]);

  /** Consoles filtered by searchQuery against model name and brand name. */
  readonly filteredConsoles: Signal<ConsoleModel[]> = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.consoles();
    return this.consoles().filter((c: ConsoleModel) => {
      const modelName = this._hardwareModels().find((m: HardwareModelModel) => m.id === c.modelId)?.name ?? '';
      const brandName = this._brands().find((b: HardwareBrandModel) => b.id === c.brandId)?.name ?? '';
      return modelName.toLowerCase().includes(q) || brandName.toLowerCase().includes(q);
    });
  });

  /** Sum of prices for all filtered consoles. */
  readonly totalSpent: Signal<number> = computed((): number =>
    this.filteredConsoles().reduce((acc: number, c: ConsoleModel): number => acc + (c.price ?? 0), 0)
  );

  async ngOnInit(): Promise<void> {
    await Promise.all([this._loadConsoles(), this._loadStores(), this._loadCatalog('console')]);
  }

  /**
   * Navigates to the detail screen for the given console.
   *
   * @param {ConsoleModel} console - Console to display
   */
  onDetail(console: ConsoleModel): void {
    this._router.navigate([this._detailRoute, console.id]);
  }

  /**
   * Loads all consoles for the current user from the use-case.
   */
  private async _loadConsoles(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this._consoleUseCases.getAllForUser(this._userContext.requireUserId());
      this.consoles.set(data);
    } catch {
      this._snackBar.open(
        this._transloco.translate('consolesPage.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.loading.set(false);
    }
  }
}
