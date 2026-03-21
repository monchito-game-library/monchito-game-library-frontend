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
  template: `
    <div class="edit-panel">
      <div class="edit-panel__header">
        <h2 class="edit-panel__title">
          {{ (protector() ? 'management.products.editTitle' : 'management.products.addTitle') | transloco }}
          @if (protector()) {
            <span class="edit-panel__protector-name">— {{ protector()!.name }}</span>
          }
        </h2>
      </div>

      <form [formGroup]="form" class="edit-panel__form">
        <div class="edit-panel__fields">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'management.products.nameLabel' | transloco }}</mat-label>
            <input matInput formControlName="name" [placeholder]="'management.products.namePlaceholder' | transloco" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'management.products.categoryLabel' | transloco }}</mat-label>
            <mat-select formControlName="category">
              <mat-option value="box">{{ 'management.products.categoryBox' | transloco }}</mat-option>
              <mat-option value="console">{{ 'management.products.categoryConsole' | transloco }}</mat-option>
              <mat-option value="other">{{ 'management.products.categoryOther' | transloco }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'management.products.notesLabel' | transloco }}</mat-label>
            <textarea
              matInput
              formControlName="notes"
              rows="1"
              [placeholder]="'management.products.notesPlaceholder' | transloco"></textarea>
          </mat-form-field>
        </div>

        <div class="packs-section">
          <div class="packs-section__header">
            <span class="packs-section__title">{{ 'management.products.packsTitle' | transloco }}</span>
            <button
              mat-icon-button
              type="button"
              (click)="addPack()"
              [matTooltip]="'management.products.addPack' | transloco">
              <mat-icon>add</mat-icon>
            </button>
          </div>

          @if (packsArray.length === 0) {
            <p class="packs-section__empty">{{ 'management.products.packsEmpty' | transloco }}</p>
          }

          <div class="packs-list">
            @for (packGroup of packsArray.controls; track $index) {
              <div class="pack-row" [formGroup]="asFormGroup(packGroup)">
                <mat-form-field appearance="outline" class="pack-row__qty">
                  <mat-label>{{ 'management.products.packQty' | transloco }}</mat-label>
                  <input matInput formControlName="quantity" type="number" min="1" step="1" />
                  @if (asFormGroup(packGroup).controls['quantity'].hasError('required')) {
                    <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="pack-row__price">
                  <mat-label>{{ 'management.products.packPrice' | transloco }}</mat-label>
                  <input matInput formControlName="price" type="number" min="0.01" step="0.01" />
                  <mat-icon matSuffix>euro</mat-icon>
                  @if (asFormGroup(packGroup).controls['price'].hasError('required')) {
                    <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="pack-row__url">
                  <mat-label>{{ 'management.products.packUrl' | transloco }}</mat-label>
                  <input matInput formControlName="url" type="url" placeholder="https://..." />
                </mat-form-field>

                <button mat-icon-button type="button" (click)="removePack($index)" class="pack-row__remove">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
        </div>

        <div class="edit-panel__actions">
          @if (protector()) {
            <button
              mat-stroked-button
              type="button"
              (click)="toggled.emit()"
              [class.edit-panel__deactivate-btn]="protector()!.isActive"
              [class.edit-panel__activate-btn]="!protector()!.isActive">
              <mat-icon>{{ protector()!.isActive ? 'toggle_on' : 'toggle_off' }}</mat-icon>
              {{
                (protector()!.isActive ? 'management.products.deactivateBtn' : 'management.products.activateBtn')
                  | transloco
              }}
            </button>
          }
          <div class="edit-panel__actions-right">
            <button mat-button type="button" (click)="cancelled.emit()">{{ 'common.cancel' | transloco }}</button>
            <button
              mat-flat-button
              color="primary"
              type="button"
              (click)="onSave()"
              [disabled]="form.invalid || packsArray.length === 0">
              {{ 'common.save' | transloco }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .edit-panel {
        display: flex;
        flex-direction: column;
      }

      .edit-panel__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 2rem 0.5rem;
        flex-shrink: 0;
      }

      .edit-panel__title {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        color: var(--mat-sys-on-surface);
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-wrap: wrap;
      }

      .edit-panel__protector-name {
        font-weight: 400;
        color: var(--mat-sys-on-surface-variant);
      }

      .edit-panel__form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0.25rem 2rem 1rem;
      }

      .edit-panel__fields {
        display: grid;
        grid-template-columns: 1fr 160px 1fr;
        gap: 0 0.75rem;
        align-items: start;
      }

      .packs-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .packs-section__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .packs-section__title {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface-variant);
      }

      .packs-section__empty {
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
        font-style: italic;
        margin: 0;
      }

      .packs-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        max-height: 200px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-top: 0.5rem;
      }

      .pack-row {
        display: grid;
        grid-template-columns: 90px 160px 1fr 36px;
        gap: 0 0.5rem;
        align-items: start;
      }

      .pack-row__remove {
        margin-top: 4px;
        color: var(--mat-sys-error);
      }

      .edit-panel__actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .edit-panel__actions-right {
        display: flex;
        gap: 0.5rem;
        margin-left: auto;
      }

      .edit-panel__deactivate-btn {
        color: var(--mat-sys-error);
        border-color: var(--mat-sys-error);
      }

      .edit-panel__activate-btn {
        color: var(--mat-sys-primary);
        border-color: var(--mat-sys-primary);
      }

      @media (max-width: 768px) {
        .edit-panel__header {
          padding: 0.75rem 1rem 0.5rem;
        }

        .edit-panel__protector-name {
          display: none;
        }

        .edit-panel__form {
          padding: 0.25rem 1rem 1rem;
        }

        .edit-panel__fields {
          grid-template-columns: 1fr;
        }

        .packs-list {
          max-height: 160px;
        }

        .pack-row {
          grid-template-columns: 80px 1fr 36px;

          .pack-row__qty {
            grid-area: 1 / 1;
          }
          .pack-row__price {
            grid-area: 1 / 2;
          }
          .pack-row__remove {
            grid-area: 1 / 3;
          }
          .pack-row__url {
            grid-area: 2 / 1 / 3 / 4;
          }
        }
      }
    `
  ]
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
   * @param {number} index
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
   * @param {ProtectorModel} protector
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
   * @param {ProtectorFormResult} result
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
   * @param {ProtectorModel} protector
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
   * @param {ProtectorCategory} category
   */
  getCategoryLabel(category: ProtectorCategory): string {
    return this._transloco.translate(
      `management.products.category${category.charAt(0).toUpperCase() + category.slice(1)}`
    );
  }

  /**
   * Returns the cheapest unit price across all packs of the protector.
   *
   * @param {ProtectorModel} protector
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
