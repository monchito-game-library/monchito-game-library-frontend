import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatTabNav, MatTabLink, MatTabNavPanel, MatIcon, TranslocoPipe]
})
export class GamesComponent {}
