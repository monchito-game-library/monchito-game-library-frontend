import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';

import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

import { CATALOG_USE_CASES, CatalogUseCasesContract } from '@/domain/use-cases/catalog/catalog.use-cases.contract';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';

@Component({
  selector: 'app-catalog-search-panel',
  templateUrl: './catalog-search-panel.component.html',
  styleUrl: './catalog-search-panel.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    NgOptimizedImage,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    MatIcon,
    MatProgressSpinner,
    TranslocoPipe
  ]
})
export class CatalogSearchPanelComponent implements OnInit {
  private readonly _catalogUseCases: CatalogUseCasesContract = inject(CATALOG_USE_CASES);

  private readonly _searchSubject: Subject<string> = new Subject<string>();

  /** Whether a catalogue search request is in progress. */
  readonly searchLoading: WritableSignal<boolean> = signal(false);

  /** Current catalogue search results. */
  readonly searchResults: WritableSignal<GameCatalogDto[]> = signal([]);

  /** Current search query string. */
  readonly searchQuery: WritableSignal<string> = signal('');

  /** Pre-fills the search input and triggers a search when the panel opens. */
  readonly initialQuery: InputSignal<string> = input<string>('');

  /** Emitted when the user selects a game from the search results. */
  readonly gameSelected: OutputEmitterRef<GameCatalogDto> = output<GameCatalogDto>();

  constructor() {
    this._searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query: string) => void this._performSearch(query));
  }

  async ngOnInit(): Promise<void> {
    const query = this.initialQuery().trim();
    if (query) {
      this.searchQuery.set(query);
      await this._performSearch(query);
    }
  }

  /**
   * Handles the search input event and pushes the value to the debounce subject.
   *
   * @param {Event} event - Input event from the search field
   */
  onSearchInput(event: Event): void {
    const query: string = (event.target as HTMLInputElement).value.trim();
    this.searchQuery.set(query);
    this._searchSubject.next(query);
  }

  /**
   * Emits the selected game to the parent component.
   *
   * @param {GameCatalogDto} game - The catalogue game entry selected by the user
   */
  onSelectGame(game: GameCatalogDto): void {
    this.gameSelected.emit(game);
  }

  /**
   * Executes a RAWG catalogue search and updates the results signal.
   * Triggered automatically by the debounced subject.
   *
   * @param {string} query - Search term
   */
  private async _performSearch(query: string): Promise<void> {
    if (!query.trim()) {
      this.searchResults.set([]);
      return;
    }

    this.searchLoading.set(true);
    try {
      const results: GameCatalogDto[] = await this._catalogUseCases.searchGames(query, 1, 20);
      this.searchResults.set(results);
    } catch {
      this.searchResults.set([]);
    } finally {
      this.searchLoading.set(false);
    }
  }
}
