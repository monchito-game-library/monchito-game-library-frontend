import { Injectable, signal, WritableSignal } from '@angular/core';

/**
 * Presentation service that holds reactive user preferences state.
 * Contains no business logic — only shares state between components.
 */
@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  /** Current user's avatar URL, or null if not set. */
  readonly avatarUrl: WritableSignal<string | null> = signal(null);

  /** Whether an avatar upload is in progress. */
  readonly uploadingAvatar: WritableSignal<boolean> = signal(false);
}
