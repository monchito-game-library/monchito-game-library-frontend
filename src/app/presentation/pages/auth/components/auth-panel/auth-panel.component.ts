import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';

@Component({
  selector: 'app-auth-panel',
  templateUrl: './auth-panel.component.html',
  styleUrl: './auth-panel.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LibIconComponent]
})
export class AuthPanelComponent {}
