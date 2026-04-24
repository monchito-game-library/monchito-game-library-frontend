import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { GameListModel } from '@/models/game/game-list.model';
import { UserRoleType } from '@/types/user-role.type';

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

  /** Whether a banner upload is in progress. */
  readonly uploadingBanner: WritableSignal<boolean> = signal(false);

  /** URL of the cover currently used as the profile panel banner. */
  readonly bannerImageUrl: WritableSignal<string | null> = signal(null);

  /** Whether user preferences have been loaded from Supabase at least once. */
  readonly preferencesLoaded: WritableSignal<boolean> = signal(false);

  /** Cached game collection for the list view — set on first load to avoid duplicate fetches. */
  readonly allGames: WritableSignal<GameListModel[]> = signal([]);

  /** Last scroll offset of the game list CDK viewport — persisted across navigation to/from detail. */
  readonly gameListScrollOffset: WritableSignal<number> = signal(0);

  /** Current user role, defaulting to 'user' until preferences are loaded. */
  readonly role: WritableSignal<UserRoleType> = signal<UserRoleType>('user');

  /** Whether the current user has the admin role. */
  readonly isAdmin: Signal<boolean> = computed((): boolean => this.role() === 'admin');
}
