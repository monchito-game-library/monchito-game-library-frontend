import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameFormComponent } from '@/components/game-form/game-form.component';

@Component({
  selector: 'app-update-game',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameFormComponent],
  template: `<app-game-form />`,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
    `
  ]
})
export class CreateAndUpdateGameComponent {}
