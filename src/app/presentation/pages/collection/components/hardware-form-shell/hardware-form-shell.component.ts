import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  TemplateRef
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RetroIconButtonComponent } from '@retro/retro-icon-button/retro-icon-button.component';
import { RetroInputComponent } from '@retro/retro-input/retro-input.component';
import { RetroTextareaComponent } from '@retro/retro-textarea/retro-textarea.component';
import { RetroSelectComponent } from '@retro/retro-select/retro-select.component';
import { RetroOptionComponent } from '@retro/retro-select/components/retro-option/retro-option.component';
import { RetroSearchComponent } from '@retro/retro-search/retro-search.component';
import { RetroDatepickerComponent } from '@retro/retro-datepicker/retro-datepicker.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { StoreModel } from '@/models/store/store.model';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import { RetroSkeletonComponent } from '@retro/retro-skeleton/retro-skeleton.component';

/**
 * Presentational shell component that renders the shared form layout for hardware
 * create/update pages (consoles and controllers). All display data is received as
 * signal inputs and user actions are emitted as outputs.
 *
 * Entity-specific fields are projected via the `extraFieldsTpl` TemplateRef input.
 */
@Component({
  selector: 'app-hardware-form-shell',
  templateUrl: './hardware-form-shell.component.html',
  styleUrl: './hardware-form-shell.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    RetroIconButtonComponent,
    TranslocoPipe,
    RetroSkeletonComponent,
    RetroButtonComponent,
    RetroInputComponent,
    RetroTextareaComponent,
    RetroSelectComponent,
    RetroOptionComponent,
    RetroSearchComponent,
    RetroDatepickerComponent
  ]
})
export class HardwareFormShellComponent {
  /** Whether the hardware data is still being loaded (edit mode). */
  readonly loading: InputSignal<boolean> = input.required<boolean>();

  /** Whether the save operation is in progress. */
  readonly saving: InputSignal<boolean> = input.required<boolean>();

  /** True when editing an existing item, false when creating a new one. */
  readonly isEditMode: InputSignal<boolean> = input.required<boolean>();

  /**
   * Transloco key prefix used to resolve page-specific i18n strings.
   * e.g. 'consolePage' or 'controllerPage'.
   */
  readonly i18nPrefix: InputSignal<string> = input.required<string>();

  /** All hardware brands available for selection. */
  readonly brands: InputSignal<HardwareBrandModel[]> = input.required<HardwareBrandModel[]>();

  /** Hardware models filtered by the selected brand. */
  readonly models: InputSignal<HardwareModelModel[]> = input.required<HardwareModelModel[]>();

  /** Hardware editions filtered by the selected model. */
  readonly editions: InputSignal<HardwareEditionModel[]> = input.required<HardwareEditionModel[]>();

  /** Brands filtered by the current search query. */
  readonly filteredBrands: InputSignal<HardwareBrandModel[]> = input.required<HardwareBrandModel[]>();

  /** Models filtered by the current search query. */
  readonly filteredModels: InputSignal<HardwareModelModel[]> = input.required<HardwareModelModel[]>();

  /** Stores filtered by the current search query. */
  readonly filteredStores: InputSignal<StoreModel[]> = input.required<StoreModel[]>();

  /** The reactive form group managed by the parent component. */
  readonly form: InputSignal<FormGroup> = input.required<FormGroup>();

  /** Function that resolves a brand UUID to its display name. */
  readonly displayBrandLabel: InputSignal<(value: unknown) => string> = input.required<(value: unknown) => string>();

  /** Function that resolves a model UUID to its display name. */
  readonly displayModelLabel: InputSignal<(value: unknown) => string> = input.required<(value: unknown) => string>();

  /** Function that resolves a store UUID to its display label. */
  readonly displayStoreLabel: InputSignal<(value: unknown) => string> = input.required<(value: unknown) => string>();

  /** TemplateRef that projects entity-specific fields (e.g. region for consoles, color+compatibility for controllers). */
  readonly extraFieldsTpl: InputSignal<TemplateRef<unknown>> = input.required<TemplateRef<unknown>>();

  /** Emitted when the user clicks the cancel or back button. */
  readonly cancelClick: OutputEmitterRef<void> = output<void>();

  /** Emitted when the user submits the form. */
  readonly submitClick: OutputEmitterRef<void> = output<void>();

  /** Emitted when the brand search query changes, so the parent can filter the brands list. */
  readonly brandQuery: OutputEmitterRef<string> = output<string>();

  /** Emitted when the model search query changes, so the parent can filter the models list. */
  readonly modelQuery: OutputEmitterRef<string> = output<string>();

  /** Emitted when the store search query changes, so the parent can filter the stores list. */
  readonly storeQuery: OutputEmitterRef<string> = output<string>();

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;
}
