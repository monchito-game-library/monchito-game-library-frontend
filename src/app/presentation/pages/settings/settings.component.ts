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
import { FormControl } from '@angular/forms';
import { firstValueFrom, Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoService } from '@ngneat/transloco';
import { ThemeService } from '@/services/theme.service';
import { UserContextService } from '@/services/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import {
  USER_PREFERENCES_USE_CASES,
  UserPreferencesUseCasesContract
} from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { RAWG_REPOSITORY, RawgRepositoryContract } from '@/domain/repositories/rawg.repository.contract';
import { AUTH_USE_CASES, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { availableLangConstant } from '@/constants/available-lang.constant';
import { AvailableLanguageInterface } from '@/interfaces/available-language.interface';
import { AvatarCropDialogComponent } from '@/components/avatar-crop-dialog/avatar-crop-dialog.component';
import { ToggleSwitchComponent } from '@/components/ad-hoc/toggle-switch/toggle-switch.component';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
    SkeletonComponent
  ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  // --- Inyecciones privadas ---
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _userPreferencesUseCases: UserPreferencesUseCasesContract = inject(USER_PREFERENCES_USE_CASES);
  private readonly _rawgRepo: RawgRepositoryContract = inject(RAWG_REPOSITORY);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);

  // --- Variables privadas ---
  private readonly _searchSubject: Subject<string> = new Subject<string>();
  private _searchSubscription?: Subscription;

  // --- Variables públicas readonly ---
  /** Idiomas disponibles para el selector. */
  readonly availableLanguages: AvailableLanguageInterface[] = availableLangConstant;

  // --- Signals públicos ---
  /** URL del avatar del usuario, null si no se ha subido ninguno. */
  readonly avatarUrl: WritableSignal<string | null> = this._userPreferencesState.avatarUrl;

  /** Indica si se está subiendo un avatar en este momento. */
  readonly uploadingAvatar: WritableSignal<boolean> = this._userPreferencesState.uploadingAvatar;

  /** Indica si se está subiendo un banner en este momento. */
  readonly uploadingBanner: WritableSignal<boolean> = this._userPreferencesState.uploadingBanner;

  /** URL de la portada actualmente usada como fondo del panel de perfil. */
  readonly bannerImageUrl: WritableSignal<string | null> = this._userPreferencesState.bannerImageUrl;

  /** Estado actual del modo oscuro, sincronizado con ThemeService. */
  readonly isDark: Signal<boolean> = this._themeService.isDarkMode;

  /** Resultados de búsqueda de RAWG (o juegos populares cuando no hay búsqueda). */
  readonly rawgResults: WritableSignal<GameCatalogDto[]> = this._userPreferencesState.rawgSearchResults;

  /** Indica si hay una carga de RAWG en curso. */
  readonly rawgSearchLoading: WritableSignal<boolean> = this._userPreferencesState.rawgSearchLoading;

  /** Último término buscado en RAWG, para mostrar el estado vacío. */
  readonly rawgSearchQuery: WritableSignal<string> = this._userPreferencesState.rawgSearchQuery;

  /** Indica si las preferencias del usuario ya han sido cargadas desde Supabase. */
  readonly preferencesLoaded: WritableSignal<boolean> = this._userPreferencesState.preferencesLoaded;

  /** Array de 12 elementos para renderizar los skeletons del grid de portadas. */
  readonly skeletonThumbs: undefined[] = Array(12);

  /** Indica si el modo de edición del nombre está activo. */
  readonly editingName: WritableSignal<boolean> = signal(false);

  /** Valor actual del input mientras se edita el nombre. */
  readonly nameInputValue: WritableSignal<string> = signal('');

  /** Indica si se está guardando el nuevo nombre. */
  readonly savingName: WritableSignal<boolean> = signal(false);

  // --- Configuraciones públicas ---
  /** Control reactivo para el idioma seleccionado. */
  readonly selectedLangControl: FormControl<string> = new FormControl(this._transloco.getActiveLang(), {
    nonNullable: true
  });

  /** Referencia al input de edición de nombre para enfocar al activar el modo edición. */
  @ViewChild('nameInput') nameInputRef?: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.selectedLangControl.valueChanges.subscribe((lang: string) => {
      if (!lang) return;
      this._transloco.setActiveLang(lang);
      this._savePreferences();
    });

    this._searchSubscription = this._searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query: string) => void this._executeSearch(query));

    void this._loadInitialBanners();
  }

  ngOnDestroy(): void {
    this._searchSubscription?.unsubscribe();
  }

  /**
   * Establece la portada seleccionada como fondo del panel y la persiste en Supabase.
   *
   * @param {string} url - URL de la portada elegida
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
   * Emite el término de búsqueda al subject para aplicar debounce.
   *
   * @param {Event} event - Evento del input de búsqueda
   */
  onRawgSearch(event: Event): void {
    const query: string = (event.target as HTMLInputElement).value;
    this._userPreferencesState.rawgSearchQuery.set(query);
    this._searchSubject.next(query);
  }

  /**
   * Alterna entre tema oscuro y claro y persiste la preferencia en Supabase.
   */
  toggleTheme(): void {
    this.isDark() ? this._themeService.setLightTheme() : this._themeService.setDarkTheme();
    this._savePreferences();
  }

  /**
   * Abre el dialog de recorte al seleccionar un fichero de avatar.
   * Una vez confirmado el recorte, sube el blob resultante a Supabase Storage.
   *
   * @param {Event} event - Evento del input file
   */
  async onAvatarFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const dialogRef = this._dialog.open(AvatarCropDialogComponent, {
      data: { file, title: 'Ajusta tu foto de perfil', aspectRatio: 1, roundCropper: true, resizeToWidth: 300 },
      width: '480px',
      maxWidth: '95vw'
    });

    const blob: Blob | null | undefined = await firstValueFrom(dialogRef.afterClosed());
    if (!blob) return;

    const userId: string | null = this._userContext.userId();
    if (!userId) return;

    const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

    this._userPreferencesState.uploadingAvatar.set(true);
    try {
      const url: string = await this._userPreferencesUseCases.uploadAvatar(userId, croppedFile);
      this._userPreferencesState.avatarUrl.set(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al subir la imagen';
      this._snackBar.open(message, 'Cerrar', { duration: 4000 });
    } finally {
      this._userPreferencesState.uploadingAvatar.set(false);
    }
  }

  /**
   * Abre el dialog de recorte al seleccionar un fichero para el banner.
   * Una vez confirmado el recorte, sube el blob resultante a Supabase Storage.
   *
   * @param {Event} event - Evento del input file
   */
  async onBannerFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const dialogRef = this._dialog.open(AvatarCropDialogComponent, {
      data: { file, title: 'Ajusta tu banner', aspectRatio: 16 / 9, roundCropper: false, resizeToWidth: 1280 },
      width: '640px',
      maxWidth: '95vw'
    });

    const blob: Blob | null | undefined = await firstValueFrom(dialogRef.afterClosed());
    if (!blob) return;

    const userId: string | null = this._userContext.userId();
    if (!userId) return;

    const croppedFile = new File([blob], 'banner.jpg', { type: 'image/jpeg' });

    this._userPreferencesState.uploadingBanner.set(true);
    try {
      const url: string = await this._userPreferencesUseCases.uploadBanner(userId, croppedFile);
      this._userPreferencesState.bannerImageUrl.set(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al subir el banner';
      this._snackBar.open(message, 'Cerrar', { duration: 4000 });
    } finally {
      this._userPreferencesState.uploadingBanner.set(false);
    }
  }

  /**
   * Activa el modo edición del nombre e inicializa el input con el valor actual.
   */
  onEditName(): void {
    this.nameInputValue.set(this.getDisplayName());
    this.editingName.set(true);
    setTimeout(() => this.nameInputRef?.nativeElement.focus(), 0);
  }

  /**
   * Cancela la edición del nombre y vuelve al modo lectura.
   */
  onCancelEditName(): void {
    this.editingName.set(false);
  }

  /**
   * Valida y guarda el nuevo nombre en Supabase auth metadata.
   * Si el nombre no ha cambiado, cancela sin llamar a la API.
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
      const message = error instanceof Error ? error.message : 'Error al actualizar el nombre';
      this._snackBar.open(message, 'Cerrar', { duration: 4000 });
    } finally {
      this.savingName.set(false);
    }
  }

  /**
   * Obtiene el nombre para mostrar del usuario autenticado.
   */
  getDisplayName(): string {
    return this._userContext.getDisplayName();
  }

  /**
   * Obtiene el email del usuario autenticado.
   */
  getUserEmail(): string | null {
    return this._userContext.getUserEmail();
  }

  /**
   * Obtiene la URL del avatar del usuario.
   * Prioriza el avatar subido sobre el generado automáticamente.
   */
  getAvatarUrl(): string {
    return this.avatarUrl() ?? this._userContext.getAvatarUrl();
  }

  /**
   * Llama a la API de RAWG con el término de búsqueda y actualiza los resultados.
   * Si la búsqueda está vacía, recarga los juegos populares iniciales.
   * Filtra los juegos sin imagen para garantizar que todos los resultados son usables como banner.
   *
   * @param {string} query - Término de búsqueda
   */
  private async _executeSearch(query: string): Promise<void> {
    if (!query.trim()) {
      await this._loadInitialBanners();
      return;
    }
    this._userPreferencesState.rawgSearchLoading.set(true);
    try {
      const results: GameCatalogDto[] = await this._rawgRepo.searchGames(query, 1, 12);
      this._userPreferencesState.rawgSearchResults.set(results.filter((game: GameCatalogDto) => !!game.image_url));
    } catch {
      this._userPreferencesState.rawgSearchResults.set([]);
    } finally {
      this._userPreferencesState.rawgSearchLoading.set(false);
    }
  }

  /**
   * Carga los juegos más valorados de RAWG para mostrar como sugerencias iniciales de banner.
   */
  private async _loadInitialBanners(): Promise<void> {
    this._userPreferencesState.rawgSearchLoading.set(true);
    try {
      const results: GameCatalogDto[] = await this._rawgRepo.getTopGames(12);
      this._userPreferencesState.rawgSearchResults.set(results.filter((game: GameCatalogDto) => !!game.image_url));
    } catch {
      this._userPreferencesState.rawgSearchResults.set([]);
    } finally {
      this._userPreferencesState.rawgSearchLoading.set(false);
    }
  }

  /**
   * Persiste el tema e idioma actuales en Supabase si hay usuario autenticado.
   */
  private _savePreferences(): void {
    const userId: string | null = this._userContext.userId();
    if (!userId) return;
    const theme: 'light' | 'dark' = this.isDark() ? 'dark' : 'light';
    const language: 'es' | 'en' = this._transloco.getActiveLang() as 'es' | 'en';
    void this._userPreferencesUseCases.savePreferences(userId, theme, language);
  }
}
