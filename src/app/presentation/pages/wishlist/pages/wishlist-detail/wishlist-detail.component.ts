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
import { DecimalPipe, Location, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { WISHLIST_USE_CASES, WishlistUseCasesContract } from '@/domain/use-cases/wishlist/wishlist.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { WISHLIST_PRIORITY_OPTIONS } from '@/constants/wishlist-priority.constant';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';

@Component({
  selector: 'app-wishlist-detail',
  templateUrl: './wishlist-detail.component.html',
  styleUrl: './wishlist-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    NgOptimizedImage,
    MatIcon,
    MatIconButton,
    MatButton,
    MatTooltip,
    TranslocoPipe,
    SkeletonComponent
  ]
})
export class WishlistDetailComponent implements OnInit {
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _location: Location = inject(Location);
  private readonly _wishlistUseCases: WishlistUseCasesContract = inject(WISHLIST_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Priority star range used to render the star icons. */
  readonly priorityRange: number[] = WISHLIST_PRIORITY_OPTIONS;

  /** Whether the item is being loaded from the service (fallback path). */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** The wishlist item being displayed. */
  readonly item: WritableSignal<WishlistItemModel | null> = signal<WishlistItemModel | null>(null);

  /** Store search links derived from the item. */
  readonly storeLinks: Signal<{ label: string; url: string }[]> = computed(() => {
    const i = this.item();
    if (!i) return [];
    const searchTerm = i.platform ? `${i.title} ${i.platform}` : i.title;
    const q = encodeURIComponent(searchTerm);
    const qPlus = searchTerm.replace(/ /g, '+');
    const qTitle = encodeURIComponent(i.title);
    return [
      { label: 'Amazon', url: `https://www.amazon.es/s?k=${qPlus}` },
      { label: 'GAME', url: `https://www.game.es/buscar/${qTitle}` },
      { label: 'CEX', url: `https://es.webuy.com/search/?stext=${qPlus}` },
      { label: 'Xtralife', url: `https://www.xtralife.com/buscar/${q}/` }
    ];
  });

  async ngOnInit(): Promise<void> {
    const stateItem = (window.history.state as { item?: WishlistItemModel })?.item;
    if (stateItem) {
      this.item.set(stateItem);
    } else {
      await this._loadItem();
    }
  }

  /**
   * Navigates back in the browser history.
   */
  onBack(): void {
    void this._router.navigate(['/wishlist']);
  }

  /**
   * Navigates to the wishlist list with the current item's ID so the edit form opens automatically.
   */
  onEdit(): void {
    const i = this.item();
    if (!i) return;
    void this._router.navigate(['/wishlist'], { state: { editItemId: i.id } });
  }

  /**
   * Shows a confirm dialog and deletes the item. On success navigates back.
   */
  async onDelete(): Promise<void> {
    const i = this.item();
    if (!i) return;

    const dialogData: ConfirmDialogInterface = {
      title: this._transloco.translate('wishlist.dialog.deleteTitle'),
      message: this._transloco.translate('wishlist.dialog.deleteMessage', { title: i.title })
    };
    const ref = this._dialog.open<ConfirmDialogComponent, ConfirmDialogInterface, boolean>(ConfirmDialogComponent, {
      data: dialogData
    });
    const confirmed: boolean | undefined = await firstValueFrom(ref.afterClosed());
    if (!confirmed) return;

    try {
      await this._wishlistUseCases.deleteItem(this._userId, i.id);
      this._snackBar.open(
        this._transloco.translate('wishlist.snack.deleted'),
        this._transloco.translate('common.close'),
        { duration: 2000 }
      );
      this._location.back();
    } catch {
      this._snackBar.open(
        this._transloco.translate('wishlist.snack.deleteError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    }
  }

  /**
   * Shows a confirm dialog, removes the item from the wishlist and navigates to /add pre-filled.
   */
  async onOwn(): Promise<void> {
    const i = this.item();
    if (!i) return;

    const dialogData: ConfirmDialogInterface = {
      title: this._transloco.translate('wishlist.dialog.ownTitle'),
      message: this._transloco.translate('wishlist.dialog.ownMessage', { title: i.title })
    };
    const ref = this._dialog.open<ConfirmDialogComponent, ConfirmDialogInterface, boolean>(ConfirmDialogComponent, {
      data: dialogData
    });
    const confirmed: boolean | undefined = await firstValueFrom(ref.afterClosed());
    if (!confirmed) return;

    const catalogEntry: GameCatalogDto = {
      rawg_id: i.rawgId,
      title: i.title,
      slug: i.slug,
      image_url: i.imageUrl,
      released_date: i.releasedDate,
      rating: i.rating,
      platforms: i.platforms,
      genres: i.genres,
      source: i.rawgId ? 'rawg' : 'manual',
      esrb_rating: null,
      metacritic_score: null
    };

    void this._router.navigate(['/collection/games/add'], { state: { catalogEntry, wishlistItemId: i.id } });
  }

  /**
   * Loads the item by ID from the service as a fallback when there is no router state.
   */
  private async _loadItem(): Promise<void> {
    this.loading.set(true);
    try {
      const id: string = this._route.snapshot.paramMap.get('id')!;
      const items: WishlistItemModel[] = await this._wishlistUseCases.getAllForUser(this._userId);
      const found: WishlistItemModel | undefined = items.find((i) => i.id === id);
      if (found) {
        this.item.set(found);
      } else {
        this._snackBar.open(
          this._transloco.translate('wishlist.snack.notFound'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
        this._location.back();
      }
    } catch {
      this._snackBar.open(
        this._transloco.translate('wishlist.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
      this._location.back();
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Returns the authenticated user ID or throws if not authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }
}
