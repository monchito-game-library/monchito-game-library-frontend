import { Component } from '@angular/core';
import { GameFormComponent } from '../../components/game-form/game-form.component';

@Component({
  selector: 'app-update-game',
  standalone: true,
  imports: [GameFormComponent],
  template: ` <app-game-form />`
})
export class CreateAndUpdateGameComponent {}
