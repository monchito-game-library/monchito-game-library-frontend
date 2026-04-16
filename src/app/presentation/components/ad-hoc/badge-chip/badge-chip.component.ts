import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { BadgeChipVariant } from '@/types/badge-chip-variant.type';

@Component({
  selector: 'app-badge-chip',
  template: `{{ label() }}`,
  styleUrl: './badge-chip.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"badge-chip badge-chip--" + variant()'
  }
})
export class BadgeChipComponent {
  /** Text displayed inside the chip. */
  readonly label: InputSignal<string> = input.required<string>();

  /** Visual variant — controls color scheme and shape. Defaults to 'neutral'. */
  readonly variant: InputSignal<BadgeChipVariant> = input<BadgeChipVariant>('neutral');
}
