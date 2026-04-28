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
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

import { DatepickerFieldClickDirective } from '@/shared/datepicker-field-click/datepicker-field-click.directive';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { StoreModel } from '@/models/store/store.model';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';

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
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    DatepickerFieldClickDirective,
    MatProgressSpinner,
    TranslocoPipe,
    SkeletonComponent
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

  /** Brands filtered by the current autocomplete input value. */
  readonly filteredBrands: InputSignal<HardwareBrandModel[]> = input.required<HardwareBrandModel[]>();

  /** Models filtered by the current autocomplete input value. */
  readonly filteredModels: InputSignal<HardwareModelModel[]> = input.required<HardwareModelModel[]>();

  /** Stores filtered by the current autocomplete input value. */
  readonly filteredStores: InputSignal<StoreModel[]> = input.required<StoreModel[]>();

  /** The reactive form group managed by the parent component. */
  readonly form: InputSignal<FormGroup> = input.required<FormGroup>();

  /** Function that resolves a brand UUID to its display name. */
  readonly displayBrandLabel: InputSignal<(id: string | null) => string> =
    input.required<(id: string | null) => string>();

  /** Function that resolves a model UUID to its display name. */
  readonly displayModelLabel: InputSignal<(id: string | null) => string> =
    input.required<(id: string | null) => string>();

  /** Function that resolves a store UUID to its display label. */
  readonly displayStoreLabel: InputSignal<(id: string | null) => string> =
    input.required<(id: string | null) => string>();

  /** TemplateRef that projects entity-specific fields (e.g. region for consoles, color+compatibility for controllers). */
  readonly extraFieldsTpl: InputSignal<TemplateRef<unknown>> = input.required<TemplateRef<unknown>>();

  /** Emitted when the user clicks the cancel or back button. */
  readonly cancelClick: OutputEmitterRef<void> = output<void>();

  /** Emitted when the user submits the form. */
  readonly submitClick: OutputEmitterRef<void> = output<void>();

  /** Emitted when the user selects a brand from the autocomplete. */
  readonly brandChange: OutputEmitterRef<string | null> = output<string | null>();

  /** Emitted when the user selects a model from the autocomplete. */
  readonly modelChange: OutputEmitterRef<string | null> = output<string | null>();

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;
}
