import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameInterface } from './models/game.interface';
import { IndexedDBRepository } from './repositories/indexeddb.repository'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private _indexedDBRepository: IndexedDBRepository = inject(IndexedDBRepository);

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser()) return;

    const data: GameInterface[] = await this._indexedDBRepository.getAll();
    if (data.length === 0) {
      const response = await fetch('assets/games.json');
      const games: GameInterface[] = await response.json();
      for (const game of games) {
        await this._indexedDBRepository.add(game);
      }
    }
  }
}
