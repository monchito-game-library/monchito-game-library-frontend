// ─── Componentes ──────────────────────────────────────────────────────────────
export { RetroButtonComponent } from './retro-button/retro-button.component';
export { RetroIconComponent } from './retro-icon/retro-icon.component';
export { RetroCardComponent } from './retro-card/retro-card.component';
export { RetroListComponent } from './retro-list/retro-list.component';
export { RetroListItemComponent } from './retro-list/components/retro-list-item/retro-list-item.component';
export { RetroChipComponent } from './retro-chip/retro-chip.component';
export { RetroDataRowComponent } from './retro-data-row/retro-data-row.component';
export { RetroSectionHeaderComponent } from './retro-section-header/retro-section-header.component';
export { RetroCommandBarComponent } from './retro-command-bar/retro-command-bar.component';
export { RetroEmptyStateComponent } from './retro-empty-state/retro-empty-state.component';
export { RetroIconButtonComponent } from './retro-icon-button/retro-icon-button.component';
export { RetroSpinnerComponent } from './retro-spinner/retro-spinner.component';
export { RetroSkeletonComponent } from './retro-skeleton/retro-skeleton.component';
export { RetroCheckboxComponent } from './retro-checkbox/retro-checkbox.component';
export { RetroSnackbarHostComponent } from './retro-snackbar/components/retro-snackbar-host/retro-snackbar-host.component';
export { RetroInputComponent } from './retro-input/retro-input.component';
export { RetroTextareaComponent } from './retro-textarea/retro-textarea.component';
export { RetroSelectComponent } from './retro-select/retro-select.component';
export { RetroOptionComponent } from './retro-select/components/retro-option/retro-option.component';
export { RetroSearchComponent } from './retro-search/retro-search.component';
export { RetroDatepickerComponent } from './retro-datepicker/retro-datepicker.component';
export { RetroMenuComponent } from './retro-menu/retro-menu.component';
export { RetroMenuItemComponent } from './retro-menu/components/retro-menu-item/retro-menu-item.component';
export { RetroMenuTriggerDirective } from './retro-menu/directive/retro-menu-trigger.directive';
export { RetroTabsComponent } from './retro-tabs/retro-tabs.component';
export { RetroTabComponent } from './retro-tabs/components/retro-tab/retro-tab.component';
export { RetroTooltipDirective } from './retro-tooltip/directive/retro-tooltip.directive';
export { RetroSegmentedComponent } from './retro-segmented/retro-segmented.component';

// ─── Servicios ────────────────────────────────────────────────────────────────
export { RetroSnackbarService } from './retro-snackbar/services/retro-snackbar.service';
export {
  RetroDialogService,
  RetroDialogRef,
  RETRO_DIALOG_DATA,
  RetroDialogTitleDirective,
  RetroDialogContentDirective,
  RetroDialogActionsDirective,
  RetroDialogCloseDirective
} from './retro-dialog/services/retro-dialog.service';
export {
  RetroOverlayService,
  RetroOverlayRef,
  RETRO_OVERLAY_REF,
  RETRO_OVERLAY_DATA
} from './retro-overlay/services/retro-overlay.service';
export {
  RetroBottomSheetService,
  RETRO_BOTTOM_SHEET_DATA
} from './retro-bottom-sheet/services/retro-bottom-sheet.service';

// ─── Tokens expuestos a consumidores externos ─────────────────────────────────
export { RETRO_FORM_FIELD_CONTROL } from './retro-form-field/tokens/retro-form-field-control.token';
export type { RetroFormFieldControl } from './retro-form-field/tokens/retro-form-field-control.token';

// ─── Tipos expuestos a consumidores externos ──────────────────────────────────
export type { RetroChipColor } from './retro-chip/retro-chip.types';
export type { LibSnackbarVariant } from './retro-snackbar/interfaces/retro-snackbar-message.interface';
export type { RetroSnackbarMessage } from './retro-snackbar/services/retro-snackbar.service';
export type {
  RetroListItemVariant,
  RetroListItemPadding
} from './retro-list/components/retro-list-item/retro-list-item.types';
export type { RetroSegmentedOption } from './retro-segmented/retro-segmented.types';

// ─── Interfaces expuestas a consumidores externos ─────────────────────────────
export type { RetroTabItem } from './retro-tabs/interfaces/retro-tab-item.interface';
export type { RetroDialogConfig } from './retro-dialog/interfaces/retro-dialog-config.interface';
