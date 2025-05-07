import {Component, Input} from '@angular/core';
import {GameInterface} from '../../models/interfaces/game.interface';
import {MatCard, MatCardContent, MatCardImage} from '@angular/material/card';
import {MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {CurrencyPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatChip} from '@angular/material/chips';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-game-card',
  imports: [
    MatCard,
    MatCardImage,
    MatIconButton,
    RouterLink,
    MatIcon,
    CurrencyPipe,
    MatCardContent,
    MatChip,
    MatTooltip
  ],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  standalone: true
})
export class GameCardComponent {
  @Input() game!: GameInterface;

  readonly defaultImage: string = 'assets/images/default-game-cover.png';

  getPlatinumIcon(): string {
    return this.game.platinum
      ? 'assets/images/platinum-trophy.png'
      : 'assets/images/hidden-trophy.webp';
  }
}
