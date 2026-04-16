import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareListBaseComponent } from '@/abstract/hardware-list-base/hardware-list-base.component';
import { ControllerModel } from '@/models/controller/controller.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { HardwareListShellComponent } from '@/pages/collection/components/hardware-list-shell/hardware-list-shell.component';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, HardwareListShellComponent]
})
export class ControllersComponent extends HardwareListBaseComponent<ControllerModel> {
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);

  protected readonly _listRoute = '/collection/controllers/add';
  protected readonly _detailRoute = '/collection/controllers';
  protected readonly _i18nLoadError = 'controllersPage.snack.loadError';

  /** List of controllers owned by the user. */
  readonly items: WritableSignal<ControllerModel[]> = signal<ControllerModel[]>([]);

  async ngOnInit(): Promise<void> {
    const userId: string = this._userContext.requireUserId();
    await Promise.all([
      this._loadItems(() => this._controllerUseCases.getAllForUser(userId)),
      this._loadStores(),
      this._loadCatalog('controller')
    ]);
  }
}
