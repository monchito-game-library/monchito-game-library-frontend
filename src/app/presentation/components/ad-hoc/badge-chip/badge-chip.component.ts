import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { BadgeChipVariant } from '@/types/badge-chip-variant.type';

@Component({
  selector: 'app-badge-chip',
  templateUrl: './badge-chip.component.html',
  styleUrl: './badge-chip.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"badge-chip badge-chip--" + variant()',
    '[style.--chip-bg]': 'bgColor()'
  }
})
export class BadgeChipComponent {
  /** Text displayed inside the chip. */
  readonly label: InputSignal<string> = input.required<string>();

  /** Visual variant — controls color scheme and shape. Defaults to 'neutral'. */
  readonly variant: InputSignal<BadgeChipVariant> = input<BadgeChipVariant>('neutral');

  /** Optional background color override (e.g. platform brand color). Only applied on the neutral variant. */
  readonly bgColor: InputSignal<string | undefined> = input<string | undefined>(undefined);
}
