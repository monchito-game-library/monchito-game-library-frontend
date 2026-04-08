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
import { DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import {
  AUDIT_LOG_USE_CASES,
  AuditLogUseCasesContract
} from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import {
  PROTECTOR_USE_CASES,
  ProtectorUseCasesContract
} from '@/domain/use-cases/protector/protector.use-cases.contract';
import { ProtectorModel, ProtectorPack } from '@/models/protector/protector.model';
import { ProtectorCategory } from '@/types/protector-category.type';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';

/** Shape emitted by the edit panel on save. */
interface ProtectorFormResult {
  name: string;
  packs: ProtectorPack[];
  category: ProtectorCategory;
  notes: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit panel component (inline, below the page header)
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-protector-edit-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    TranslocoPipe
  ],
  templateUrl: './protector-edit-panel.component.html',
  styleUrl: './protector-edit-panel.component.scss'
})
export class ProtectorEditPanelComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** The protector to edit, or null when creating a new one. */
  readonly protector = input<ProtectorModel | null>(null);

  /** Emitted when the user confirms the form. */
  readonly saved = output<ProtectorFormResult>();

  /** Emitted when the user cancels or closes the panel. */
  readonly cancelled = output<void>();

  /** Emitted when the user toggles the active state of the protector. */
  readonly toggled = output<void>();

  readonly form = this._fb.group({
    name: ['' as string, Validators.required],
    category: ['box' as ProtectorCategory],
    notes: [null as string | null],
    packs: this._fb.array([])
  });

  constructor() {
    effect(() => {
      const p = this.protector();
      this.form.patchValue({ name: p?.name ?? '', category: p?.category ?? 'box', notes: p?.notes ?? null });
      while (this.packsArray.length) {
        this.packsArray.removeAt(0, { emitEvent: false });
      }
      (p?.packs ?? []).forEach((pack) => this.packsArray.push(this._buildPackGroup(pack), { emitEvent: false }));
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  /** Typed accessor for the packs FormArray. */
  get packsArray(): FormArray {
    return this.form.get('packs') as FormArray;
  }

  /**
   * Casts an AbstractControl to FormGroup for use in the template.
   *
   * @param {import('@angular/forms').AbstractControl} control
   */
  asFormGroup(control: import('@angular/forms').AbstractControl): FormGroup {
    return control as FormGroup;
  }

  /**
   * Appends an empty pack row to the packs array.
   */
  addPack(): void {
    this.packsArray.push(
      this._buildPackGroup({ quantity: null as unknown as number, price: null as unknown as number, url: null })
    );
  }

  /**
   * Removes the pack at the given index.
   *
   * @param {number} index - Índice del elemento en la lista
   */
  removePack(index: number): void {
    this.packsArray.removeAt(index);
  }

  /**
   * Validates the form and emits the result to the parent component.
   */
  onSave(): void {
    if (this.form.invalid || this.packsArray.length === 0) return;
    const raw = this.form.getRawValue();
    this.saved.emit({
      name: raw.name as string,
      category: raw.category as ProtectorCategory,
      notes: raw.notes?.trim() || null,
      packs: (raw.packs as { quantity: number; price: number; url: string | null }[]).map((p) => ({
        quantity: Number(p.quantity),
        price: Number(p.price),
        url: p.url?.trim() || null
      }))
    });
  }

  /**
   * Builds a FormGroup for a single pack row.
   *
   * @param {{ quantity: number; price: number; url: string | null }} pack
   */
  private _buildPackGroup(pack: { quantity: number; price: number; url: string | null }): FormGroup {
    return this._fb.group({
      quantity: [pack.quantity, [Validators.required, Validators.min(1)]],
      price: [pack.price, [Validators.required, Validators.min(0.01)]],
      url: [pack.url ?? '']
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-protectors-management',
  templateUrl: './protectors-management.component.html',
  styleUrl: './protectors-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProtectorEditPanelComponent, MatButton, MatIcon, MatProgressSpinner, TranslocoPipe, DecimalPipe]
})
export class ProtectorsManagementComponent implements OnInit {
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _protectorUseCases: ProtectorUseCasesContract = inject(PROTECTOR_USE_CASES);
  private readonly _auditLogUseCases: AuditLogUseCasesContract = inject(AUDIT_LOG_USE_CASES);

  /** Whether the protector list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** All protectors loaded from Supabase. */
  readonly protectors: WritableSignal<ProtectorModel[]> = signal([]);

  /** Protector open in the edit panel; null when adding new; undefined when panel is closed. */
  readonly selectedProtector: WritableSignal<ProtectorModel | null | undefined> = signal(undefined);

  /** Whether the edit panel is visible. */
  readonly panelOpen: WritableSignal<boolean> = signal(false);

  async ngOnInit(): Promise<void> {
    await this._loadProtectors();
  }

  /**
   * Opens the edit panel in "add new protector" mode.
   */
  onAddProtector(): void {
    this.selectedProtector.set(null);
    this.panelOpen.set(true);
  }

  /**
   * Selects a protector and opens the edit panel.
   *
   * @param {ProtectorModel} protector - Protector al que pertenece la acción
   */
  onSelectProtector(protector: ProtectorModel): void {
    this.selectedProtector.set(protector);
    this.panelOpen.set(true);
  }

  /**
   * Closes the edit panel and clears the selection.
   */
  onClosePanel(): void {
    this.panelOpen.set(false);
    this.selectedProtector.set(undefined);
  }

  /**
   * Persists the new or updated protector and closes the panel.
   *
   * @param {ProtectorFormResult} result - Resultado del formulario de protector
   */
  async onSaved(result: ProtectorFormResult): Promise<void> {
    const current = this.selectedProtector();
    if (current) {
      await this._protectorUseCases.updateProtector(current.id, result);
      void this._auditLogUseCases.log({
        action: 'protector.update',
        entityType: 'protector',
        entityId: current.id,
        description: result.name
      });
    } else {
      await this._protectorUseCases.addProtector({ ...result, isActive: true });
      void this._auditLogUseCases.log({
        action: 'protector.create',
        entityType: 'protector',
        entityId: null,
        description: result.name
      });
    }
    await this._loadProtectors();
    this.onClosePanel();
  }

  /**
   * Shows a confirmation dialog and toggles the active state of the protector.
   *
   * @param {ProtectorModel} protector - Protector al que pertenece la acción
   */
  onToggleActive(protector: ProtectorModel): void {
    const nextActive: boolean = !protector.isActive;
    const key: string = nextActive ? 'management.products.activateConfirm' : 'management.products.deactivateConfirm';
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate(key, { name: protector.name }),
        message: ''
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      await this._protectorUseCases.toggleProtectorActive(protector.id, nextActive);
      void this._auditLogUseCases.log({
        action: 'protector.toggle_active',
        entityType: 'protector',
        entityId: protector.id,
        description: `${protector.name} → ${nextActive ? 'active' : 'inactive'}`
      });
      await this._loadProtectors();
    });
  }

  /**
   * Returns the i18n label for a protector category.
   *
   * @param {ProtectorCategory} category - Categoría del protector
   */
  getCategoryLabel(category: ProtectorCategory): string {
    return this._transloco.translate(
      `management.products.category${category.charAt(0).toUpperCase() + category.slice(1)}`
    );
  }

  /**
   * Returns the cheapest unit price across all packs of the protector.
   *
   * @param {ProtectorModel} protector - Protector al que pertenece la acción
   */
  getMinUnitPrice(protector: ProtectorModel): number {
    if (!protector.packs.length) return 0;
    return Math.min(...protector.packs.map((p) => p.price / p.quantity));
  }

  /**
   * Fetches all protectors from Supabase and updates the protectors signal.
   */
  private async _loadProtectors(): Promise<void> {
    this.loading.set(true);
    try {
      const protectors: ProtectorModel[] = await this._protectorUseCases.getAllProtectors();
      this.protectors.set(protectors);
    } finally {
      this.loading.set(false);
    }
  }
}
