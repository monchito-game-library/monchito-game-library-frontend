import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareListBaseComponent } from '@/abstract/hardware-list-base/hardware-list-base.component';
import { ConsoleModel } from '@/models/console/console.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import { HardwareListShellComponent } from '@/pages/collection/components/hardware-list-shell/hardware-list-shell.component';
import { BadgeChipComponent } from '@/components/ad-hoc/badge-chip/badge-chip.component';

@Component({
  selector: 'app-consoles',
  templateUrl: './consoles.component.html',
  styleUrls: ['./consoles.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TranslocoPipe, HardwareListShellComponent, BadgeChipComponent]
})
export class ConsolesComponent extends HardwareListBaseComponent<ConsoleModel> {
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);

  protected readonly _listRoute = '/collection/consoles/add';
  protected readonly _detailRoute = '/collection/consoles';
  protected readonly _i18nLoadError = 'consolesPage.snack.loadError';

  /** List of consoles owned by the user. */
  readonly items: WritableSignal<ConsoleModel[]> = signal<ConsoleModel[]>([]);

  async ngOnInit(): Promise<void> {
    const userId: string | null = this._userContext.userId();
    if (!userId) return;
    await Promise.all([
      this._loadItems(() => this._consoleUseCases.getAllForUser(userId)),
      this._loadStores(),
      this._loadCatalog('console')
    ]);
  }
}
