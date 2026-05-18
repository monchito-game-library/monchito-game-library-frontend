import { ChangeDetectionStrategy, Component } from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroListComponent {}
