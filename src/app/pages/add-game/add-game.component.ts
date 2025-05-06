import {Component, inject, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import { Router } from '@angular/router';
import {IndexedDBRepository} from '../../repositories/indexeddb.repository';
import {GameInterface} from '../../models/game.interface';
import {GamesConsoleType} from '../../models/games-console.type';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatCard} from '@angular/material/card';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormField, MatLabel, MatInput, MatCard, MatSelect, MatOption, MatCheckbox, MatButton, MatIconButton, MatIcon, MatError],
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent {
  private _indexedDBRepository = inject(IndexedDBRepository);
  private _router = inject(Router);
  private _matSnackBar: MatSnackBar = inject(MatSnackBar);

  @ViewChild('gameForm') gameForm!: NgForm;

  game: GameInterface = {
    title: '',
    price: 0,
    store: '',
    condition: 'New',
    platinum: false,
    description: '',
    platform: 'PS5'
  };

  platforms: GamesConsoleType[] = [
    'PS5', 'PS4', 'PS3', 'PS2', 'PSP',
    'XBOX ORIGINAL', 'XBOX 360', 'XBOX ONE',
    'XBOX SERIES', 'SWITCH', 'XBOX'
  ];

  goBack(): void {
    this._router.navigateByUrl('/').then();
  }

  async submit() {
    if (this.gameForm.valid) {
      await this._indexedDBRepository.add(this.game);
      this._matSnackBar.open('Game saved successfully!', 'Close', { duration: 3000 });
      this.goBack();
    }
  }
}
