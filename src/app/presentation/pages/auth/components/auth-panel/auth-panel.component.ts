import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';

@Component({
  selector: 'app-auth-panel',
  templateUrl: './auth-panel.component.html',
  styleUrl: './auth-panel.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RetroIconComponent]
})
export class AuthPanelComponent {}
