import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameFormComponent } from '@/pages/games/pages/game-list/pages/create-update-game/components/game-form/game-form.component';

@Component({
  selector: 'app-update-game',
  templateUrl: './create-and-update-game.component.html',
  styleUrl: './create-and-update-game.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameFormComponent]
})
/** Route-level wrapper that renders the shared GameFormComponent for both create and update flows. */
export class CreateAndUpdateGameComponent {}
