import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, firstValueFrom, Subject } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ThemeService } from '@/services/theme/theme.service';
import { UserContextService } from '@/services/user-context/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';
import { RawgSearchStateService } from '@/services/rawg-search-state/rawg-search-state.service';
import {
  USER_PREFERENCES_USE_CASES,
  UserPreferencesUseCasesContract
} from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { CATALOG_USE_CASES, CatalogUseCasesContract } from '@/domain/use-cases/catalog/catalog.use-cases.contract';
import { AUTH_USE_CASES, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { BannerSuggestionModel } from '@/models/banner/banner-suggestion.model';
import { availableLangConstant } from '@/constants/available-lang.constant';
import { AvailableLanguageInterface } from '@/interfaces/available-language.interface';
import { AvatarCropDialogComponent } from '@/pages/settings/components/avatar-crop-dialog/avatar-crop-dialog.component';
import { ToggleSwitchComponent } from '@/components/ad-hoc/toggle-switch/toggle-switch.component';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatDivider,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatIcon,
    MatProgressSpinner,
    MatTooltip,
    ToggleSwitchComponent,
    SkeletonComponent,
    TranslocoPipe
  ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _rawgSearchState: RawgSearchStateService = inject(RawgSearchStateService);
  private readonly _userPreferencesUseCases: UserPreferencesUseCasesContract = inject(USER_PREFERENCES_USE_CASES);
  private readonly _catalogUseCases: CatalogUseCasesContract = inject(CATALOG_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);

  private readonly _searchSubject: Subject<string> = new Subject<string>();
  private _focusTimer: ReturnType<typeof setTimeout> | null = null;

  /** Available languages for the language selector. */
  readonly availableLanguages: AvailableLanguageInterface[] = availableLangConstant;

  /** Current user's avatar URL, or null if none has been uploaded. */
  readonly avatarUrl: WritableSignal<string | null> = this._userPreferencesState.avatarUrl;

  /** Whether an avatar upload is currently in progress. */
  readonly uploadingAvatar: WritableSignal<boolean> = this._userPreferencesState.uploadingAvatar;

  /** Whether a banner upload is currently in progress. */
  readonly uploadingBanner: WritableSignal<boolean> = this._userPreferencesState.uploadingBanner;

  /** URL of the cover currently used as the profile panel background. */
  readonly bannerImageUrl: WritableSignal<string | null> = this._userPreferencesState.bannerImageUrl;

  /** Current dark-mode state, synchronized with ThemeService. */
  readonly isDark: Signal<boolean> = this._themeService.isDarkMode;

  /** RAWG banner suggestions, or popular games when no search has been performed. */
  readonly rawgResults: WritableSignal<BannerSuggestionModel[]> = this._rawgSearchState.rawgSearchResults;

  /** Whether a RAWG search request is in progress. */
  readonly rawgSearchLoading: WritableSignal<boolean> = this._rawgSearchState.rawgSearchLoading;

  /** Last RAWG search term entered, used to show the empty state. */
  readonly rawgSearchQuery: WritableSignal<string> = this._rawgSearchState.rawgSearchQuery;

  /** Whether user preferences have been loaded from Supabase at least once. */
  readonly preferencesLoaded: WritableSignal<boolean> = this._userPreferencesState.preferencesLoaded;

  /** Array of 12 undefined elements used to render the cover grid skeletons. */
  readonly skeletonThumbs: undefined[] = Array(12);

  /** Whether the display-name edit mode is active. */
  readonly editingName: WritableSignal<boolean> = signal(false);

  /** Current value of the name input while editing. */
  readonly nameInputValue: WritableSignal<string> = signal('');

  /** Whether the new display name is being saved. */
  readonly savingName: WritableSignal<boolean> = signal(false);

  /** Reactive form control for the selected language. */
  readonly selectedLangControl: FormControl<string> = new FormControl(this._transloco.getActiveLang(), {
    nonNullable: true
  });

  /** Reference to the name input element, used to focus it when edit mode is activated. */
  @ViewChild('nameInput') nameInputRef?: ElementRef<HTMLInputElement>;

  constructor() {
    this._searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query: string) => void this._executeSearch(query));
  }

  ngOnInit(): void {
    this.selectedLangControl.valueChanges.subscribe((lang: string) => {
      if (!lang) return;
      this._transloco.setActiveLang(lang);
      this._savePreferences();
    });

    void this._loadInitialBanners();
  }

  ngOnDestroy(): void {
    if (this._focusTimer !== null) clearTimeout(this._focusTimer);
  }

  /**
   * Sets the selected cover as the profile panel background and persists it in Supabase.
   *
   * @param {string} url - URL of the chosen cover image
   */
  onSelectBanner(url: string): void {
    const currentBannerUrl: string | null = this._userPreferencesState.bannerImageUrl();
    this._userPreferencesState.bannerImageUrl.set(url);
    const userId: string | null = this._userContext.userId();
    if (userId) {
      void this._userPreferencesUseCases.saveBannerUrl(userId, url, currentBannerUrl);
    }
  }

  /**
   * Pushes the search term to the subject to apply to debounce.
   *
   * @param {Event} event - Input event from the search field
   */
  onRawgSearch(event: Event): void {
    const query: string = (event.target as HTMLInputElement).value;
    this._rawgSearchState.rawgSearchQuery.set(query);
    this._searchSubject.next(query);
  }

  /**
   * Toggles between dark and light theme and persists the preference in Supabase.
   */
  toggleTheme(): void {
    this.isDark() ? this._themeService.setLightTheme() : this._themeService.setDarkTheme();
    this._savePreferences();
  }

  /**
   * Opens the crop dialog when an avatar file is selected.
   * Once the crop is confirmed, uploads the resulting blob to Supabase Storage.
   *
   * @param {Event} event - File input event
   */
  async onAvatarFileSelected(event: Event): Promise<void> {
    await this._handleImageUpload(
      event,
      {
        title: this._transloco.translate('settings.cropDialog.avatarTitle'),
        aspectRatio: 1,
        roundCropper: true,
        resizeToWidth: 300,
        dialogWidth: '480px',
        fileName: 'avatar.jpg'
      },
      this._userPreferencesState.uploadingAvatar,
      (userId, file) => this._userPreferencesUseCases.uploadAvatar(userId, file),
      (url) => this._userPreferencesState.avatarUrl.set(url),
      'settings.errors.uploadImage'
    );
  }

  /**
   * Opens the crop dialog when a banner file is selected.
   * Once the crop is confirmed, uploads the resulting blob to Supabase Storage.
   *
   * @param {Event} event - File input event
   */
  async onBannerFileSelected(event: Event): Promise<void> {
    await this._handleImageUpload(
      event,
      {
        title: this._transloco.translate('settings.cropDialog.bannerTitle'),
        aspectRatio: 16 / 9,
        roundCropper: false,
        resizeToWidth: 1280,
        dialogWidth: '640px',
        fileName: 'banner.jpg'
      },
      this._userPreferencesState.uploadingBanner,
      (userId, file) => this._userPreferencesUseCases.uploadBanner(userId, file),
      (url) => this._userPreferencesState.bannerImageUrl.set(url),
      'settings.errors.uploadBanner'
    );
  }

  /**
   * Activates display-name edit mode and initializes the input with the current value.
   */
  onEditName(): void {
    this.nameInputValue.set(this.getDisplayName());
    this.editingName.set(true);
    this._focusTimer = setTimeout(() => this.nameInputRef?.nativeElement.focus(), 0);
  }

  /**
   * Cancels display-name editing and returns to read mode.
   */
  onCancelEditName(): void {
    this.editingName.set(false);
  }

  /**
   * Validates and saves the new display name to Supabase auth metadata.
   * Cancels without calling the API if the name has not changed.
   */
  async onSaveName(): Promise<void> {
    const name: string = this.nameInputValue().trim();
    if (!name || name === this.getDisplayName()) {
      this.editingName.set(false);
      return;
    }

    this.savingName.set(true);
    try {
      await this._authUseCases.updateDisplayName(name);
      this.editingName.set(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : this._transloco.translate('settings.errors.updateName');
      this._snackBar.open(message, this._transloco.translate('common.close'), { duration: 4000 });
    } finally {
      this.savingName.set(false);
    }
  }

  /**
   * Returns the authenticated user's display name.
   */
  getDisplayName(): string {
    return this._userContext.getDisplayName();
  }

  /**
   * Returns the authenticated user's email address.
   */
  getUserEmail(): string | null {
    return this._userContext.getUserEmail();
  }

  /**
   * Signs out the current user.
   */
  logout(): void {
    this._userContext.clearUser();
  }

  /**
   * Returns the user's avatar URL.
   * Prioritizes the uploaded avatar over the automatically generated one.
   */
  getAvatarUrl(): string {
    return this.avatarUrl() ?? this._userContext.getAvatarUrl();
  }

  /**
   * Opens the crop dialog, uploads the resulting blob to Supabase Storage and updates the URL signal.
   * Extracts the shared logic of onAvatarFileSelected and onBannerFileSelected.
   *
   * @param {Event} event - File input event
   * @param {{ title: string; aspectRatio: number; roundCropper: boolean; resizeToWidth: number; dialogWidth: string; fileName: string }} cropConfig - Crop dialog options
   * @param {WritableSignal<boolean>} loadingSignal - Loading signal to activate during upload
   * @param {(userId: string, file: File) => Promise<string>} uploadFn - Use-case upload function
   * @param {(url: string) => void} setUrl - Callback to update the URL signal after upload
   * @param {string} errorKey - Translation key for the generic error message
   */
  private async _handleImageUpload(
    event: Event,
    cropConfig: {
      title: string;
      aspectRatio: number;
      roundCropper: boolean;
      resizeToWidth: number;
      dialogWidth: string;
      fileName: string;
    },
    loadingSignal: WritableSignal<boolean>,
    uploadFn: (userId: string, file: File) => Promise<string>,
    setUrl: (url: string) => void,
    errorKey: string
  ): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const dialogRef = this._dialog.open(AvatarCropDialogComponent, {
      data: {
        file,
        title: cropConfig.title,
        aspectRatio: cropConfig.aspectRatio,
        roundCropper: cropConfig.roundCropper,
        resizeToWidth: cropConfig.resizeToWidth
      },
      width: cropConfig.dialogWidth,
      maxWidth: '95vw'
    });

    const blob: Blob | null | undefined = await firstValueFrom(dialogRef.afterClosed());
    if (!blob) return;

    const userId: string | null = this._userContext.userId();
    if (!userId) return;

    const croppedFile = new File([blob], cropConfig.fileName, { type: 'image/jpeg' });

    loadingSignal.set(true);
    try {
      const url: string = await uploadFn(userId, croppedFile);
      setUrl(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : this._transloco.translate(errorKey);
      this._snackBar.open(message, this._transloco.translate('common.close'), { duration: 4000 });
    } finally {
      loadingSignal.set(false);
    }
  }

  /**
   * Calls the RAWG API with the search term and updates the results signal.
   * If the query is empty, reloads the initial popular games.
   * Filters out games without an image to ensure all results are usable as banners.
   *
   * @param {string} query - Search term
   */
  private async _executeSearch(query: string): Promise<void> {
    if (!query.trim()) {
      await this._loadInitialBanners();
      return;
    }
    this._rawgSearchState.rawgSearchLoading.set(true);
    try {
      const results: BannerSuggestionModel[] = await this._catalogUseCases.searchBanners(query, 12);
      this._rawgSearchState.rawgSearchResults.set(results.filter((b: BannerSuggestionModel) => !!b.imageUrl));
    } catch {
      this._rawgSearchState.rawgSearchResults.set([]);
    } finally {
      this._rawgSearchState.rawgSearchLoading.set(false);
    }
  }

  /**
   * Loads the top-rated RAWG games to display as initial banner suggestions.
   */
  private async _loadInitialBanners(): Promise<void> {
    this._rawgSearchState.rawgSearchLoading.set(true);
    try {
      const results: BannerSuggestionModel[] = await this._catalogUseCases.getTopBanners(12);
      this._rawgSearchState.rawgSearchResults.set(results.filter((b: BannerSuggestionModel) => !!b.imageUrl));
    } catch {
      this._rawgSearchState.rawgSearchResults.set([]);
    } finally {
      this._rawgSearchState.rawgSearchLoading.set(false);
    }
  }

  /**
   * Persists the current theme and language preferences in Supabase if there is an authenticated user.
   */
  private _savePreferences(): void {
    const userId: string | null = this._userContext.userId();
    if (!userId) return;
    const theme: 'light' | 'dark' = this.isDark() ? 'dark' : 'light';
    const language: 'es' | 'en' = this._transloco.getActiveLang() as 'es' | 'en';
    void this._userPreferencesUseCases.savePreferences(userId, theme, language);
  }
}
