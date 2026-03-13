import { Injectable, signal, WritableSignal } from '@angular/core';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';

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

  /** List of game cover URLs available for use as panel banner. */
  readonly gameImageUrls: WritableSignal<string[]> = signal([]);

  /** URL of the cover currently used as the profile panel banner. */
  readonly bannerImageUrl: WritableSignal<string | null> = signal(null);

  /** RAWG search results for the banner picker. */
  readonly rawgSearchResults: WritableSignal<GameCatalogDto[]> = signal([]);

  /** Whether a RAWG banner search is in progress. */
  readonly rawgSearchLoading: WritableSignal<boolean> = signal(false);

  /** Current search query in the banner RAWG search input. */
  readonly rawgSearchQuery: WritableSignal<string> = signal('');

  /** Whether user preferences have been loaded from Supabase at least once. */
  readonly preferencesLoaded: WritableSignal<boolean> = signal(false);

  /** Whether the game image URLs have been loaded from Supabase at least once. */
  readonly gamesLoaded: WritableSignal<boolean> = signal(false);
}
