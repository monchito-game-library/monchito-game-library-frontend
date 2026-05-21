import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { Router } from '@angular/router';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroDialogService } from '@retro/retro-dialog/services/retro-dialog.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { RetroSkeletonComponent } from '@retro/retro-skeleton/retro-skeleton.component';

import {
  HARDWARE_BRAND_USE_CASES,
  HardwareBrandUseCasesContract
} from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareBrandFormResult } from '@/interfaces/management/hardware-brand-form-result.interface';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { RetroCardComponent } from '@retro/retro-card/retro-card.component';
import { HardwareBrandEditPanelComponent } from '../../components/hardware-brand-edit-panel/hardware-brand-edit-panel.component';
import { SearchToolbarComponent } from '@/components/search-toolbar/search-toolbar.component';

/** Management page for hardware brands. Entry point of the hardware catalog drill-down. */
@Component({
  selector: 'app-hardware-brands-management',
  templateUrl: './hardware-brands-management.component.html',
  styleUrl: './hardware-brands-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HardwareBrandEditPanelComponent,
    TranslocoPipe,
    RetroCardComponent,
    RetroSkeletonComponent,
    RetroButtonComponent,
    RetroIconComponent,
    SearchToolbarComponent
  ]
})
export class HardwareBrandsManagementComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _dialog: RetroDialogService = inject(RetroDialogService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);

  /** Whether the brand list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** All hardware brands loaded from Supabase. */
  readonly brands: WritableSignal<HardwareBrandModel[]> = signal<HardwareBrandModel[]>([]);

  /** Brand open in the edit panel; null = adding new; undefined = panel closed. */
  readonly selectedBrand: WritableSignal<HardwareBrandModel | null | undefined> = signal<
    HardwareBrandModel | null | undefined
  >(undefined);

  /** Whether the edit panel is visible. */
  readonly panelOpen: WritableSignal<boolean> = signal<boolean>(false);

  /** Término de búsqueda activo para filtrar por nombre. */
  readonly searchTerm: WritableSignal<string> = signal<string>('');

  /** Lista filtrada según searchTerm. */
  readonly filteredBrands: Signal<HardwareBrandModel[]> = computed((): HardwareBrandModel[] => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.brands();
    return this.brands().filter((item) => item.name.toLowerCase().includes(term));
  });

  /** Flags para retro-command-bar. */
  readonly commandFlags: Signal<readonly string[]> = computed((): readonly string[] => {
    const term = this.searchTerm();
    return term ? [`search="${term}"`] : [];
  });

  async ngOnInit(): Promise<void> {
    await this._loadBrands();
  }

  /**
   * Actualiza el término de búsqueda cuando el usuario escribe en el toolbar.
   * @param {string} term - Valor ya debounced recibido del SearchToolbarComponent
   */
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  /**
   * Opens the edit panel in add mode.
   */
  onAddBrand(): void {
    this.selectedBrand.set(null);
    this.panelOpen.set(true);
  }

  /**
   * Selects a brand and opens the edit panel.
   *
   * @param {HardwareBrandModel} brand - Brand to edit
   */
  onSelectBrand(brand: HardwareBrandModel): void {
    this.selectedBrand.set(brand);
    this.panelOpen.set(true);
  }

  /**
   * Navigates to the models list for the selected brand.
   *
   * @param {HardwareBrandModel} brand - Brand to drill into
   */
  onOpenModels(brand: HardwareBrandModel): void {
    void this._router.navigate(['/management/hardware', brand.id, 'models']);
  }

  /**
   * Closes the edit panel and clears the selection.
   */
  onClosePanel(): void {
    this.panelOpen.set(false);
    this.selectedBrand.set(undefined);
  }

  /**
   * Persists the new or updated brand and reloads the list.
   *
   * @param {HardwareBrandFormResult} result - Form result from the edit panel
   */
  async onSaved(result: HardwareBrandFormResult): Promise<void> {
    const current = this.selectedBrand();
    if (current) {
      await this._brandUseCases.update(current.id, { name: result.name });
    } else {
      await this._brandUseCases.create({ name: result.name });
    }
    await this._loadBrands();
    this.onClosePanel();
  }

  /**
   * Shows a confirmation dialog and removes the brand on confirm.
   */
  onDeleteBrand(): void {
    const brand = this.selectedBrand();
    if (!brand) return;
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('management.hardware.brands.deleteConfirm', { name: brand.name }),
        message: this._transloco.translate('management.hardware.brands.deleteWarning')
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean | undefined) => {
      if (!confirmed) return;
      await this._brandUseCases.delete(brand.id);
      await this._loadBrands();
      this.onClosePanel();
    });
  }

  /**
   * Loads all hardware brands and updates the signal.
   */
  private async _loadBrands(): Promise<void> {
    this.loading.set(true);
    try {
      this.brands.set(await this._brandUseCases.getAll());
    } finally {
      this.loading.set(false);
    }
  }
}
