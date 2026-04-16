import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Shell component for the hardware management section. Renders the active sub-page. */
@Component({
  selector: 'app-hardware-management',
  template: '<router-outlet />',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet]
})
export class HardwareManagementComponent {}
