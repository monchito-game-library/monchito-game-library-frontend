import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { RETRO_LIST_PARENT } from './tokens/retro-list-parent.token';
import { RetroListParent } from './interfaces/retro-list-parent.interface';

/**
 * Contenedor flex-column para listas Terminal Collector.
 * Sin lógica de estado — el consumidor gestiona loading/empty con @if/@for.
 *
 * CSS custom properties:
 * - --retro-list-gap: espaciado entre ítems. Default 0.5rem.
 */
@Component({
  selector: 'retro-list',
  standalone: true,
  imports: [],
  templateUrl: './retro-list.component.html',
  styleUrl: './retro-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: RETRO_LIST_PARENT, useExisting: forwardRef(() => RetroListComponent) }]
})
export class RetroListComponent implements RetroListParent {}
