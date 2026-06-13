/** Data payload for the confirmation dialog, passed via `RetroDialogService`. */
export interface ConfirmDialogInterface {
  /** Title shown at the top of the dialog. */
  title: string;
  /** Body message describing the action to confirm. */
  message: string;
}
