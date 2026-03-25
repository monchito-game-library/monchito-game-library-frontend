import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, Location, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { WISHLIST_USE_CASES, WishlistUseCasesContract } from '@/domain/use-cases/wishlist/wishlist.use-cases.contract';
import { CATALOG_USE_CASES, CatalogUseCasesContract } from '@/domain/use-cases/catalog/catalog.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { WishlistItemForm, WishlistItemFormValue } from '@/interfaces/forms/wishlist-item-form.interface';
import { WISHLIST_PRIORITY_OPTIONS } from '@/constants/wishlist-priority.constant';
import { WishlistCardComponent } from '@/pages/wishlist/components/wishlist-card/wishlist-card.component';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { GameSearchPanelComponent } from '@/components/game-search-panel/game-search-panel.component';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    SlicePipe,
    ReactiveFormsModule,
    MatButton,
    MatFabButton,
    MatIconButton,
    MatProgressSpinner,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatIcon,
    MatProgressSpinner,
    TranslocoPipe,
    WishlistCardComponent,
    GameSearchPanelComponent
  ]
})
export class WishlistComponent implements OnInit {
  private readonly _wishlistUseCases: WishlistUseCasesContract = inject(WISHLIST_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _router: Router = inject(Router);
  private readonly _location: Location = inject(Location);
  private readonly _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly _catalogUseCases: CatalogUseCasesContract = inject(CATALOG_USE_CASES);

  /** Item being edited in mobile form mode (null = add mode). */
  private _editingItem: WishlistItemModel | null = null;

  /** Whether the current edit was initiated from the detail page. */
  private _returnToDetail: boolean = false;

  /** ID of the item whose detail page to return to after edit. */
  private _returnToDetailId: string | null = null;

  /** Whether items are being loaded from Supabase. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** Full list of wishlist items. */
  readonly items: WritableSignal<WishlistItemModel[]> = signal<WishlistItemModel[]>([]);

  /** Total estimated spend (sum of desired prices that have a value). */
  readonly totalEstimatedSpend: Signal<number> = computed((): number =>
    this.items().reduce((acc, item) => acc + (item.desiredPrice ?? 0), 0)
  );

  /** Number of items with a desired price set. */
  readonly itemsWithPrice: Signal<number> = computed(
    (): number => this.items().filter((item) => item.desiredPrice !== null).length
  );

  /** Whether the viewport is mobile (≤ 768px). */
  readonly isMobile: Signal<boolean> = toSignal(
    this._breakpointObserver.observe('(max-width: 768px)').pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  /** Mobile view mode: list → search → form. */
  readonly viewMode: WritableSignal<'list' | 'search' | 'form'> = signal<'list' | 'search' | 'form'>('list');

  /** Game selected in mobile search step (add flow only). */
  readonly pendingCatalogEntry: WritableSignal<GameCatalogDto | null> = signal<GameCatalogDto | null>(null);

  /** Available priority levels (1–5). */
  readonly priorityOptions: number[] = WISHLIST_PRIORITY_OPTIONS;

  /** Fresh platform list fetched from RAWG when editing an item that has a rawgId. */
  readonly editPlatforms: WritableSignal<string[]> = signal<string[]>([]);

  /** True while fetching fresh platforms from RAWG during edit. */
  readonly editPlatformsLoading: WritableSignal<boolean> = signal<boolean>(false);

  /** Reactive form used in mobile inline form mode. */
  readonly mobileForm: FormGroup<WishlistItemForm> = this._fb.group<WishlistItemForm>({
    priority: this._fb.control<number>(3, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(5)]
    }),
    platform: this._fb.control<string | null>(null, [Validators.required]),
    desiredPrice: this._fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    notes: this._fb.control<string | null>(null)
  });

  private readonly _mobileFormStatus = toSignal(this.mobileForm.statusChanges, {
    initialValue: this.mobileForm.status
  });

  /**
   * Whether the mobile confirm button should be enabled.
   * Reacts to form status changes and pending state signals.
   */
  readonly mobileCanConfirm: Signal<boolean> = computed(() => {
    this._mobileFormStatus();
    if (!this.mobileForm.valid) return false;
    if (!this._editingItem && !this.pendingCatalogEntry()) return false;
    return true;
  });

  async ngOnInit(): Promise<void> {
    await this._loadItems();
    const state = window.history.state as { editItemId?: string } | null;
    if (state?.editItemId) {
      this._returnToDetailId = state.editItemId;
      this._returnToDetail = true;
      const item: WishlistItemModel | undefined = this.items().find((i) => i.id === state.editItemId);
      if (item) this.onEditItem(item);
    }
  }

  /**
   * Navigates to the detail page of the given item, passing it via router state.
   *
   * @param {WishlistItemModel} item
   */
  onCardClicked(item: WishlistItemModel): void {
    void this._router.navigate(['/wishlist', item.id], { state: { item } });
  }

  /**
   * Switches to inline search mode to start the add flow.
   */
  onAddItem(): void {
    this._editingItem = null;
    this.pendingCatalogEntry.set(null);
    this._resetMobileForm(null);
    this.viewMode.set('search');
  }

  /**
   * Switches to inline form mode pre-filled with the given item's values.
   * If the item has a rawgId, fetches fresh platform data from RAWG in the background.
   *
   * @param {WishlistItemModel} item
   */
  onEditItem(item: WishlistItemModel): void {
    this._editingItem = item;
    this._resetMobileForm(item);
    this.editPlatforms.set([]);
    this.viewMode.set('form');
    if (item.rawgId) {
      this.editPlatformsLoading.set(true);
      void this._fetchEditPlatforms(item.rawgId);
    }
  }

  /**
   * Asks for confirmation and deletes the given wishlist item.
   *
   * @param {WishlistItemModel} item
   */
  async onDeleteItem(item: WishlistItemModel): Promise<void> {
    const dialogData: ConfirmDialogInterface = {
      title: this._transloco.translate('wishlist.dialog.deleteTitle'),
      message: this._transloco.translate('wishlist.dialog.deleteMessage', { title: item.title })
    };
    const ref = this._dialog.open<ConfirmDialogComponent, ConfirmDialogInterface, boolean>(ConfirmDialogComponent, {
      data: dialogData
    });

    const confirmed: boolean | undefined = await firstValueFrom(ref.afterClosed());
    if (!confirmed) return;

    try {
      await this._wishlistUseCases.deleteItem(this._userId, item.id);
      await this._loadItems();
      this._snackBar.open(
        this._transloco.translate('wishlist.snack.deleted'),
        this._transloco.translate('common.close'),
        { duration: 2000 }
      );
    } catch {
      this._snackBar.open(
        this._transloco.translate('wishlist.snack.deleteError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    }
  }

  /**
   * Handles "I have this game": deletes from wishlist and navigates to /add
   * with the catalog entry pre-loaded in the router state.
   *
   * @param {WishlistItemModel} item
   */
  async onOwnItem(item: WishlistItemModel): Promise<void> {
    const dialogData: ConfirmDialogInterface = {
      title: this._transloco.translate('wishlist.dialog.ownTitle'),
      message: this._transloco.translate('wishlist.dialog.ownMessage', { title: item.title })
    };
    const ref = this._dialog.open<ConfirmDialogComponent, ConfirmDialogInterface, boolean>(ConfirmDialogComponent, {
      data: dialogData
    });

    const confirmed: boolean | undefined = await firstValueFrom(ref.afterClosed());
    if (!confirmed) return;

    const catalogEntry: GameCatalogDto = {
      rawg_id: item.rawgId,
      title: item.title,
      slug: item.slug,
      image_url: item.imageUrl,
      released_date: item.releasedDate,
      rating: item.rating,
      platforms: item.platforms,
      genres: item.genres,
      source: item.rawgId ? 'rawg' : 'manual',
      esrb_rating: null,
      metacritic_score: null
    };

    void this._router.navigate(['/add'], { state: { catalogEntry, wishlistItemId: item.id } });
  }

  /**
   * Called from mobile search panel when the user picks a game.
   * Transitions to inline form mode.
   *
   * @param {GameCatalogDto} game
   */
  onMobileGameSelected(game: GameCatalogDto): void {
    this.pendingCatalogEntry.set(game);
    this.mobileForm.controls.platform.setValue(null);
    this.viewMode.set('form');
  }

  /**
   * Saves the mobile form and returns to list mode.
   */
  async onMobileConfirm(): Promise<void> {
    if (!this.mobileCanConfirm()) return;
    const formValue: WishlistItemFormValue = this.mobileForm.getRawValue();

    if (this._editingItem) {
      try {
        await this._wishlistUseCases.updateItem(this._userId, this._editingItem.id, formValue);
        await this._loadItems();
        this._snackBar.open(
          this._transloco.translate('wishlist.snack.updated'),
          this._transloco.translate('common.close'),
          { duration: 2000 }
        );
        if (this._returnToDetail && this._returnToDetailId) {
          const updated: WishlistItemModel | undefined = this.items().find((i) => i.id === this._returnToDetailId);
          this._returnToDetail = false;
          this._returnToDetailId = null;
          if (updated) {
            void this._router.navigate(['/wishlist', updated.id], { state: { item: updated } });
            return;
          }
        }
        this.viewMode.set('list');
      } catch {
        this._snackBar.open(
          this._transloco.translate('wishlist.snack.updateError'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
      }
    } else {
      const catalogEntry: GameCatalogDto = this.pendingCatalogEntry()!;
      try {
        await this._wishlistUseCases.addItem(this._userId, catalogEntry, formValue);
        await this._loadItems();
        this.viewMode.set('list');
        this._snackBar.open(
          this._transloco.translate('wishlist.snack.added'),
          this._transloco.translate('common.close'),
          { duration: 2000 }
        );
      } catch {
        this._snackBar.open(
          this._transloco.translate('wishlist.snack.addError'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
      }
    }
  }

  /**
   * Goes back to search mode from mobile form (add flow only).
   */
  onMobileBackToSearch(): void {
    this.pendingCatalogEntry.set(null);
    this.viewMode.set('search');
  }

  /**
   * Cancels the mobile flow and returns to list mode (or to the detail page if the edit
   * was initiated from there).
   */
  onMobileCancel(): void {
    this._editingItem = null;
    this.pendingCatalogEntry.set(null);
    if (this._returnToDetail) {
      this._returnToDetail = false;
      this._returnToDetailId = null;
      this._location.back();
    } else {
      this.viewMode.set('list');
    }
  }

  /**
   * Fetches fresh platform data from RAWG for the given game ID and updates editPlatforms.
   * Errors are silently ignored — the form falls back to the static platform chip.
   *
   * @param {number} rawgId - RAWG game ID
   */
  private async _fetchEditPlatforms(rawgId: number): Promise<void> {
    try {
      const details: GameCatalogDto = await this._catalogUseCases.getGameDetails(rawgId);
      this.editPlatforms.set(details.platforms);
    } catch {
      // silently ignore — static chip remains as fallback
    } finally {
      this.editPlatformsLoading.set(false);
    }
  }

  /**
   * Loads all wishlist items from Supabase.
   */
  private async _loadItems(): Promise<void> {
    this.loading.set(true);
    try {
      const data: WishlistItemModel[] = await this._wishlistUseCases.getAllForUser(this._userId);
      this.items.set(data);
    } catch {
      this._snackBar.open(
        this._transloco.translate('wishlist.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Resets the mobile form with values from an existing item (edit) or defaults (add).
   *
   * @param {WishlistItemModel | null} item
   */
  private _resetMobileForm(item: WishlistItemModel | null): void {
    this.mobileForm.reset({
      priority: item?.priority ?? 3,
      platform: item?.platform ?? null,
      desiredPrice: item?.desiredPrice ?? null,
      notes: item?.notes ?? null
    });
    const platformCtrl = this.mobileForm.controls.platform;
    if (item) {
      platformCtrl.removeValidators(Validators.required);
    } else {
      platformCtrl.addValidators(Validators.required);
    }
    platformCtrl.updateValueAndValidity();
  }

  /**
   * Returns the authenticated user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }
}
