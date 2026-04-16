import { Injectable, signal, WritableSignal } from '@angular/core';
import { BannerSuggestionModel } from '@/models/banner/banner-suggestion.model';

/**
 * Presentation service that holds the local RAWG banner search state.
 * Scoped to the settings banner picker — not shared across the application.
 */
@Injectable({ providedIn: 'root' })
export class RawgSearchStateService {
  /** RAWG banner suggestions for the settings banner picker. */
  readonly rawgSearchResults: WritableSignal<BannerSuggestionModel[]> = signal([]);

  /** Whether a RAWG banner search is in progress. */
  readonly rawgSearchLoading: WritableSignal<boolean> = signal(false);

  /** Current search query in the banner RAWG search input. */
  readonly rawgSearchQuery: WritableSignal<string> = signal('');
}
