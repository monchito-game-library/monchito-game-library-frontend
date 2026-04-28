import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

import { MatCard } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { BadgeChipComponent } from '@/components/ad-hoc/badge-chip/badge-chip.component';
import { UserContextService } from '@/services/user-context/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GameListModel } from '@/models/game/game-list.model';
import { defaultGameCover } from '@/constants/game-library.constant';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { availableGameStatuses } from '@/constants/game-status.constant';
import { GameStatusOption } from '@/interfaces/game-status-option.interface';
import { PLATFORM_COLORS } from '@/constants/platform-colors.constant';
import { extractDominantColor } from '@/shared/dominant-color/dominant-color.util';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatIconButton,
    MatIcon,
    MatTooltip,
    CurrencyPipe,
    NgOptimizedImage,
    TranslocoPipe,
    SkeletonComponent,
    BadgeChipComponent
  ]
})
export class GameCardComponent {
  private readonly _router: Router = inject(Router);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  private readonly _statuses: GameStatusOption[] = availableGameStatuses;

  /** Parsed cover position parts: [x%, y%, scale]. */
  private readonly _coverParts: Signal<[string, string, number]> = computed((): [string, string, number] => {
    const pos: string | null | undefined = this.game().coverPosition;
    if (!pos) return ['50%', '50%', 1];
    const parts: string[] = pos.split(' ');
    const x: string = parts[0] ?? '50%';
    const y: string = parts[1] ?? '50%';
    const scale: number = parts.length >= 3 ? parseFloat(parts[2]) : 1;
    return [x, y, scale];
  });

  /** Game to display (required). */
  readonly game: InputSignal<GameListModel> = input.required<GameListModel>();

  /** Whether the cover image failed to load (e.g. network/VPN issue). */
  readonly imageError: WritableSignal<boolean> = signal(false);

  /** Cover image URL, falls back to the default cover on error or when absent. */
  readonly defaultImage: Signal<string> = computed((): string =>
    this.imageError() || !this.game().imageUrl ? defaultGameCover : this.game().imageUrl!
  );

  /** Whether the cover image has finished loading. */
  readonly imageLoaded: WritableSignal<boolean> = signal(false);

  /** Dominant color extracted from the cover art, used for the hover glow and back-face tint. */
  readonly dominantColor: WritableSignal<string> = signal('rgba(0, 0, 0, 0.25)');

  /** Status option for the current game. */
  readonly gameStatus: Signal<GameStatusOption | undefined> = computed(() =>
    this._statuses.find((s) => s.code === this.game().status)
  );

  /** Edition of the game copy. */
  readonly edition: Signal<string | null> = computed(() => this.game().edition);

  /** Whether the game is marked as favourite. */
  readonly isFavorite: Signal<boolean> = computed(() => this.game().isFavorite);

  /** Whether the game is a digital copy. */
  readonly isDigital: Signal<boolean> = computed(() => this.game().format === 'digital');

  /** Whether the game currently has an active loan. */
  readonly isLoaned: Signal<boolean> = computed(() => this.game().activeLoanId !== null);

  /** Display label for the loan chip (borrower's name, truncated to 12 chars). */
  readonly loanChipLabel: Signal<string> = computed((): string => {
    const name = this.game().activeLoanTo ?? '';
    return name.length > 12 ? `${name.slice(0, 12)}…` : name;
  });

  /** CSS object-position for the cover image. */
  readonly coverObjectPosition: Signal<string> = computed((): string => {
    const [x, y] = this._coverParts();
    return `${x} ${y}`;
  });

  /** CSS transform scale for the cover image. */
  readonly coverTransform: Signal<string> = computed((): string => `scale(${this._coverParts()[2]})`);

  /** Brand accent color for the platform badge chip. Undefined for unknown platforms. */
  readonly platformColor: Signal<string | undefined> = computed(
    (): string | undefined => PLATFORM_COLORS[this.game().platform ?? '']
  );

  /** Whether the card is currently showing its back face (description). */
  readonly isFlipped: WritableSignal<boolean> = signal<boolean>(false);

  /** Emitted when the game has been successfully deleted. */
  readonly gameDeleted: OutputEmitterRef<number> = output<number>();

  constructor() {
    effect(() => {
      this.game();
      this.imageError.set(false);
      this.imageLoaded.set(false);
      this.dominantColor.set('rgba(0, 0, 0, 0.25)');
    });
  }

  /**
   * Marks the image as loaded and triggers dominant color extraction via a CORS probe.
   * Falls back silently if the image origin doesn't support CORS.
   *
   * @param {Event} event - The native load event from the img element
   */
  onImageLoaded = (event: Event): void => {
    this.imageLoaded.set(true);
    const img = event.target as HTMLImageElement;
    const src = img.currentSrc || img.src;
    if (!src) return;
    const probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = () => {
      const color = extractDominantColor(probe);
      if (color) this.dominantColor.set(color);
    };
    probe.src = src;
  };

  /**
   * Toggles the card flip to show/hide the description on the back face.
   */
  onFlip = (): void => {
    this.isFlipped.update((v: boolean) => !v);
  };

  /**
   * Navigates to the game detail page using the UUID as the route param.
   * Does nothing when the card is showing its back face.
   */
  editGame = (): void => {
    if (this.isFlipped()) return;
    void this._router.navigate(['/collection/games', this.game().uuid]);
  };

  /**
   * Opens a confirmation dialog and deletes the game if confirmed.
   */
  deleteGame = (): void => {
    const game: GameListModel = this.game();
    if (!game.uuid) return;

    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('gameCard.dialog.delete.title'),
        message: this._transloco.translate('gameCard.dialog.delete.message')
      } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed && game.uuid && game.id !== undefined) {
        await this._gameUseCases.deleteGame(this._userId, game.uuid);
        this.gameDeleted.emit(game.id);
      }
    });
  };

  /**
   * Returns the current user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }
}
