import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  WritableSignal
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import {
  HARDWARE_MODEL_USE_CASES,
  HardwareModelUseCasesContract
} from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import {
  HARDWARE_EDITION_USE_CASES,
  HardwareEditionUseCasesContract
} from '@/domain/use-cases/hardware-edition/hardware-edition.use-cases.contract';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { HardwareEditionFormResult } from '@/interfaces/management/hardware-edition-form-result.interface';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';

// ─────────────────────────────────────────────────────────────────────────────
// Edit panel component
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-hardware-edition-edit-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatButton, MatIcon, TranslocoPipe],
  templateUrl: './hardware-edition-edit-panel.component.html',
  styleUrl: './hardware-edition-edit-panel.component.scss'
})
export class HardwareEditionEditPanelComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** The edition to edit, or null when creating a new one. */
  readonly edition = input<HardwareEditionModel | null>(null);

  /** Emitted when the user confirms the form. */
  readonly saved = output<HardwareEditionFormResult>();

  /** Emitted when the user cancels. */
  readonly cancelled = output<void>();

  /** Emitted when the user requests deletion. */
  readonly deleted = output<void>();

  readonly form = this._fb.group({
    name: ['' as string, Validators.required]
  });

  constructor() {
    effect(() => {
      const e = this.edition();
      this.form.patchValue({ name: e?.name ?? '' });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  /**
   * Validates the form and emits the result.
   */
  onSave(): void {
    if (this.form.invalid) return;
    this.saved.emit({ name: this.form.getRawValue().name as string });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

/** Management page for hardware editions belonging to a specific model. */
@Component({
  selector: 'app-hardware-editions-management',
  templateUrl: './hardware-editions-management.component.html',
  styleUrl: './hardware-editions-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HardwareEditionEditPanelComponent, MatButton, MatIcon, MatProgressSpinner, TranslocoPipe]
})
export class HardwareEditionsManagementComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  private readonly _editionUseCases: HardwareEditionUseCasesContract = inject(HARDWARE_EDITION_USE_CASES);

  private _modelId: string = '';

  /** Current model (for breadcrumb). */
  readonly model: WritableSignal<HardwareModelModel | undefined> = signal<HardwareModelModel | undefined>(undefined);

  /** Whether the list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** All editions for this model. */
  readonly editions: WritableSignal<HardwareEditionModel[]> = signal<HardwareEditionModel[]>([]);

  /** Edition open in the edit panel; null = adding new; undefined = panel closed. */
  readonly selectedEdition: WritableSignal<HardwareEditionModel | null | undefined> = signal<
    HardwareEditionModel | null | undefined
  >(undefined);

  /** Whether the edit panel is visible. */
  readonly panelOpen: WritableSignal<boolean> = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    this._modelId = this._route.snapshot.paramMap.get('modelId') ?? '';
    await Promise.all([this._loadModel(), this._loadEditions()]);
  }

  /**
   * Opens the edit panel in add mode.
   */
  onAddEdition(): void {
    this.selectedEdition.set(null);
    this.panelOpen.set(true);
  }

  /**
   * Selects an edition and opens the edit panel.
   *
   * @param {HardwareEditionModel} edition - Edition to edit
   */
  onSelectEdition(edition: HardwareEditionModel): void {
    this.selectedEdition.set(edition);
    this.panelOpen.set(true);
  }

  /**
   * Navigates back to the models list for this model's brand.
   */
  onBack(): void {
    const brandId = this.model()?.brandId;
    if (brandId) {
      this._router.navigate(['/management/hardware', brandId, 'models']);
    } else {
      this._router.navigate(['/management/hardware']);
    }
  }

  /**
   * Closes the edit panel and clears the selection.
   */
  onClosePanel(): void {
    this.panelOpen.set(false);
    this.selectedEdition.set(undefined);
  }

  /**
   * Persists the new or updated edition and reloads the list.
   *
   * @param {HardwareEditionFormResult} result - Form result from the edit panel
   */
  async onSaved(result: HardwareEditionFormResult): Promise<void> {
    const current = this.selectedEdition();
    if (current) {
      await this._editionUseCases.update(current.id, { name: result.name });
    } else {
      await this._editionUseCases.create({ modelId: this._modelId, name: result.name });
    }
    await this._loadEditions();
    this.onClosePanel();
  }

  /**
   * Shows a confirmation dialog and removes the edition on confirm.
   */
  onDeleteEdition(): void {
    const edition = this.selectedEdition();
    if (!edition) return;
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('management.hardware.editions.deleteConfirm', { name: edition.name }),
        message: ''
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      await this._editionUseCases.delete(edition.id);
      await this._loadEditions();
      this.onClosePanel();
    });
  }

  /**
   * Loads the parent model for the breadcrumb.
   */
  private async _loadModel(): Promise<void> {
    const model = await this._modelUseCases.getById(this._modelId);
    this.model.set(model);
  }

  /**
   * Loads all editions for this model and updates the signal.
   */
  private async _loadEditions(): Promise<void> {
    this.loading.set(true);
    try {
      this.editions.set(await this._editionUseCases.getAllByModel(this._modelId));
    } finally {
      this.loading.set(false);
    }
  }
}
