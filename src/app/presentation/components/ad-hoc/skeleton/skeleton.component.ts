import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle]
})
export class SkeletonComponent {
  /** Width of the skeleton block (e.g. '120px', '100%'). Defaults to '100%'. */
  readonly width: InputSignal<string> = input<string>('100%');

  /** Height of the skeleton block (e.g. '1rem', '120px'). Defaults to '1rem'. */
  readonly height: InputSignal<string> = input<string>('1rem');

  /** Border radius of the skeleton block. Defaults to '8px'. Use '50%' for circles. */
  readonly borderRadius: InputSignal<string> = input<string>('8px');
}
