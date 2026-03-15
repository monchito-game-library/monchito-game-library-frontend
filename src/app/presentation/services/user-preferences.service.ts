import { Injectable, signal, WritableSignal } from '@angular/core';
import { BannerSuggestionModel } from '@/models/banner/banner-suggestion.model';
import { GameListModel } from '@/models/game/game-list.model';

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

  /** RAWG banner suggestions for the settings banner picker. */
  readonly rawgSearchResults: WritableSignal<BannerSuggestionModel[]> = signal([]);

  /** Whether a RAWG banner search is in progress. */
  readonly rawgSearchLoading: WritableSignal<boolean> = signal(false);

  /** Current search query in the banner RAWG search input. */
  readonly rawgSearchQuery: WritableSignal<string> = signal('');

  /** Whether user preferences have been loaded from Supabase at least once. */
  readonly preferencesLoaded: WritableSignal<boolean> = signal(false);

  /** Cached game collection for the list view — set on first load to avoid duplicate fetches. */
  readonly allGames: WritableSignal<GameListModel[]> = signal([]);
}
