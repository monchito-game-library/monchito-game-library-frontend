import { FormControl } from '@angular/forms';

/** Data payload injected into the delete-user confirmation dialog. */
export interface DeleteUserDialogInterface {
  /** Email of the user that will be deleted. Used as the confirmation value. */
  email: string;
}

/** Reactive form value for the delete-user confirmation dialog. */
export interface DeleteUserDialogFormValue {
  emailConfirmation: string | null;
}

/** Reactive form definition for the delete-user confirmation dialog. */
export interface DeleteUserDialogForm {
  emailConfirmation: FormControl<string | null>;
}
