import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { GameInterface } from '../../models/interfaces/game.interface';
import { GamesConsoleType } from '../../models/types/games-console.type';
import { GameConditionType } from '../../models/types/game-condition.type';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-update-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCard,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatButton,
    MatIconButton,
    RouterLink,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatLabel
  ],
  templateUrl: './update-game.component.html',
  styleUrls: ['./update-game.component.scss']
})
export class UpdateGameComponent implements OnInit {
  private _repo = inject(IndexedDBRepository);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _snackbar = inject(MatSnackBar);

  public gameForm: GameInterface = {
    id: undefined,
    title: '',
    price: 0,
    store: '',
    condition: 'Unknown',
    platinum: false,
    description: '',
    platform: 'PS5'
  };

  public platforms: GamesConsoleType[] = [
    'PS5',
    'PS4',
    'PS3',
    'PS2',
    'PSP',
    'XBOX ORIGINAL',
    'XBOX 360',
    'XBOX ONE',
    'XBOX SERIES',
    'SWITCH',
    'Nintendo Switch',
    'XBOX'
  ];

  public conditions: GameConditionType[] = ['New', 'Used', 'Unknown'];

  async ngOnInit(): Promise<void> {
    const id = Number(this._route.snapshot.paramMap.get('id'));
    if (!id) return;

    const game = await this._repo.getById(id);
    if (!game) {
      this._snackbar.open('Game not found', 'Close', { duration: 3000 });
      this._router.navigate(['/list']).then();
      return;
    }

    this.gameForm = { ...game };
  }

  async submit(): Promise<void> {
    if (!this.gameForm.id) return;

    await this._repo.update(this.gameForm);
    this._snackbar.open('Game updated successfully', 'Close', { duration: 3000 });
    this._router.navigate(['/list']).then();
  }

  cancel(): void {
    this._router.navigate(['/list']).then();
  }
}
