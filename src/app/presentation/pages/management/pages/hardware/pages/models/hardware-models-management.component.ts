import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';

import {
  HARDWARE_BRAND_USE_CASES,
  HardwareBrandUseCasesContract
} from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import {
  HARDWARE_MODEL_USE_CASES,
  HardwareModelUseCasesContract
} from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import {
  HARDWARE_CONSOLE_SPECS_USE_CASES,
  HardwareConsoleSpecsUseCasesContract
} from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases.contract';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareBrandFormResult } from '@/interfaces/management/hardware-brand-form-result.interface';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import { HardwareModelFormResult } from '@/interfaces/management/hardware-model-form-result.interface';
import { HardwareModelType } from '@/types/hardware-model.type';
import { HARDWARE_MODEL_TYPE } from '@/constants/hardware-model.constant';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { CatalogItemCardComponent } from '@/pages/management/components/catalog-item-card/catalog-item-card.component';
import { HardwareBrandEditPanelComponent } from '../../components/hardware-brand-edit-panel/hardware-brand-edit-panel.component';
import { HardwareModelEditPanelComponent } from '../../components/hardware-model-edit-panel/hardware-model-edit-panel.component';

/** Management page for hardware models belonging to a specific brand. */
@Component({
  selector: 'app-hardware-models-management',
  templateUrl: './hardware-models-management.component.html',
  styleUrl: './hardware-models-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HardwareBrandEditPanelComponent,
    HardwareModelEditPanelComponent,
    CatalogItemCardComponent,
    MatButton,
    MatIconButton,
    MatIcon,
    TranslocoPipe,
    SkeletonComponent
  ]
})
export class HardwareModelsManagementComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  private readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  private readonly _specsUseCases: HardwareConsoleSpecsUseCasesContract = inject(HARDWARE_CONSOLE_SPECS_USE_CASES);

  private _brandId: string = '';

  /** Current brand (for breadcrumb). */
  readonly brand: WritableSignal<HardwareBrandModel | undefined> = signal<HardwareBrandModel | undefined>(undefined);

  /** Whether the list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** All hardware models for this brand. */
  readonly models: WritableSignal<HardwareModelModel[]> = signal<HardwareModelModel[]>([]);

  /** Model open in the edit panel; null = adding new; undefined = panel closed. */
  readonly selectedModel: WritableSignal<HardwareModelModel | null | undefined> = signal<
    HardwareModelModel | null | undefined
  >(undefined);

  /** Console specs for the model currently in the edit panel. */
  readonly selectedSpecs: WritableSignal<HardwareConsoleSpecsModel | null> = signal<HardwareConsoleSpecsModel | null>(
    null
  );

  /** Whether the model edit panel is visible. */
  readonly panelOpen: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the brand edit panel is visible. */
  readonly brandPanelOpen: WritableSignal<boolean> = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    this._brandId = this._route.snapshot.paramMap.get('brandId') ?? '';
    await Promise.all([this._loadBrand(), this._loadModels()]);
  }

  /**
   * Opens the model edit panel in add mode, closing the brand panel if open.
   */
  onAddModel(): void {
    this.brandPanelOpen.set(false);
    this.selectedModel.set(null);
    this.selectedSpecs.set(null);
    this.panelOpen.set(true);
  }

  /**
   * Selects a model and opens the edit panel, loading its specs if it is a console.
   * Closes the brand panel if open.
   *
   * @param {HardwareModelModel} model - Model to edit
   */
  async onSelectModel(model: HardwareModelModel): Promise<void> {
    this.brandPanelOpen.set(false);
    this.selectedModel.set(model);
    this.selectedSpecs.set(null);
    this.panelOpen.set(true);
    if (model.type === HARDWARE_MODEL_TYPE['CONSOLE']) {
      const specs = await this._specsUseCases.getByModelId(model.id);
      this.selectedSpecs.set(specs ?? null);
    }
  }

  /**
   * Opens the brand edit panel for the current brand, closing the model panel if open.
   */
  onEditBrand(): void {
    this.panelOpen.set(false);
    this.selectedModel.set(undefined);
    this.selectedSpecs.set(null);
    this.brandPanelOpen.set(true);
  }

  /**
   * Closes the brand edit panel.
   */
  onBrandPanelClose(): void {
    this.brandPanelOpen.set(false);
  }

  /**
   * Persists the updated brand name and reloads the brand.
   *
   * @param {HardwareBrandFormResult} result - Form result from the brand edit panel
   */
  async onBrandSaved(result: HardwareBrandFormResult): Promise<void> {
    const b = this.brand();
    if (!b) return;
    await this._brandUseCases.update(b.id, { name: result.name });
    await this._loadBrand();
    this.onBrandPanelClose();
  }

  /**
   * Shows a confirmation dialog and removes the brand, then navigates back to the brands list.
   */
  onBrandDeleted(): void {
    const b = this.brand();
    if (!b) return;
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('management.hardware.brands.deleteConfirm', { name: b.name }),
        message: this._transloco.translate('management.hardware.brands.deleteWarning')
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      await this._brandUseCases.delete(b.id);
      this.onBack();
    });
  }

  /**
   * Navigates to the editions list for the selected model.
   *
   * @param {HardwareModelModel} model - Model to drill into
   */
  onOpenEditions(model: HardwareModelModel): void {
    this._router.navigate(['/management/hardware/models', model.id, 'editions']);
  }

  /**
   * Navigates back to the brands list.
   */
  onBack(): void {
    this._router.navigate(['/management/hardware']);
  }

  /**
   * Closes the edit panel and clears the selection.
   */
  onClosePanel(): void {
    this.panelOpen.set(false);
    this.selectedModel.set(undefined);
    this.selectedSpecs.set(null);
  }

  /**
   * Persists the new or updated model (and its specs if type=console).
   *
   * @param {HardwareModelFormResult} result - Form result from the edit panel
   */
  async onSaved(result: HardwareModelFormResult): Promise<void> {
    const current = this.selectedModel();
    let modelId: string;

    if (current) {
      await this._modelUseCases.update(current.id, { name: result.name });
      modelId = current.id;
    } else {
      const created = await this._modelUseCases.create({
        brandId: this._brandId,
        name: result.name,
        type: result.type,
        generation: result.generation,
        category: null
      });
      modelId = created.id;
    }

    if (result.specs) {
      await this._specsUseCases.upsert({
        modelId,
        launchYear: result.specs.launchYear,
        discontinuedYear: result.specs.discontinuedYear,
        category: result.specs.category,
        media: result.specs.media,
        videoResolution: result.specs.videoResolution,
        unitsSoldMillion: result.specs.unitsSoldMillion
      });
    }

    await this._loadModels();
    this.onClosePanel();
  }

  /**
   * Shows a confirmation dialog and removes the model on confirm.
   */
  onDeleteModel(): void {
    const model = this.selectedModel();
    if (!model) return;
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('management.hardware.models.deleteConfirm', { name: model.name }),
        message: this._transloco.translate('management.hardware.models.deleteWarning')
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      await this._modelUseCases.delete(model.id);
      await this._loadModels();
      this.onClosePanel();
    });
  }

  /**
   * Returns the chip labels for a hardware model card.
   *
   * @param {HardwareModelModel} model - Model to build chips for
   */
  getModelChips(model: HardwareModelModel): string[] {
    const chips: string[] = [this.getTypeLabel(model.type)];
    if (model.generation) chips.push(`Gen ${model.generation}`);
    return chips;
  }

  /**
   * Returns the display label for a hardware model type.
   *
   * @param {HardwareModelType} type - Model type
   */
  getTypeLabel(type: HardwareModelType): string {
    return type === HARDWARE_MODEL_TYPE['CONSOLE']
      ? this._transloco.translate('management.hardware.models.typeConsole')
      : this._transloco.translate('management.hardware.models.typeController');
  }

  /**
   * Loads the parent brand for the breadcrumb.
   */
  private async _loadBrand(): Promise<void> {
    const brand = await this._brandUseCases.getById(this._brandId);
    this.brand.set(brand);
  }

  /**
   * Loads all models for this brand and updates the signal.
   */
  private async _loadModels(): Promise<void> {
    this.loading.set(true);
    try {
      this.models.set(await this._modelUseCases.getAllByBrand(this._brandId));
    } finally {
      this.loading.set(false);
    }
  }
}
