import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInterface } from '../../models/interfaces/game.interface';
import { FormsModule } from '@angular/forms';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { GamesConsoleType } from '../../models/types/games-console.type';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { GameCardComponent } from '../../components/game-card/game-card.component';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatIconButton,
    RouterLink,
    MatIcon,
    GameCardComponent
  ],
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {
  private repo = inject(IndexedDBRepository);

  private _selectedConsole = signal<GamesConsoleType | ''>('');

  get selectedConsole() {
    return this._selectedConsole();
  }

  set selectedConsole(value: GamesConsoleType | '') {
    this._selectedConsole.set(value);
  }

  allGames = signal<GameInterface[]>([]);
  searchTerm = signal('');

  consoles = ['PS5', 'PS4', 'PS3', 'PS2', 'PSP', 'XBOX ORIGINAL', 'XBOX 360', 'XBOX ONE', 'XBOX SERIES', 'SWITCH'];

  filteredGames = computed(() => {
    const platform = this.selectedConsole;
    const search = this.searchTerm().toLowerCase();

    return this.allGames().filter((game) => {
      const matchesPlatform = platform ? game.platform === platform : true;
      const matchesSearch = game.title.toLowerCase().includes(search);
      return matchesPlatform && matchesSearch;
    });
  });

  async ngOnInit() {
    const data = await this.repo.getAll();
    this.allGames.set(data);
  }

  getTotalPrice(): number {
    return this.filteredGames().reduce((acc, game) => acc + (game.price || 0), 0);
  }
}
