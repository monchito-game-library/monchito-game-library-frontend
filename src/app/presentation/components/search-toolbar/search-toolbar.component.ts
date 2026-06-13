import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RetroInputComponent } from '@retro/retro-input/retro-input.component';
import { RetroCommandBarComponent } from '@retro/retro-command-bar/retro-command-bar.component';

/**
 * Toolbar standalone que combina un campo de búsqueda (retro-input) con una
 * barra de comandos (retro-command-bar). El debounce se gestiona internamente
 * y el padre solo recibe el valor final tras `debounceMs` milisegundos.
 */
@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html',
  styleUrl: './search-toolbar.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RetroInputComponent, RetroCommandBarComponent]
})
export class SearchToolbarComponent {
  // ─── Inyecciones privadas ────────────────────────────────────────────────

  // ─── Variables privadas ──────────────────────────────────────────────────

  /** Subject interno que alimenta el pipeline de debounce. */
  private readonly _input$: Subject<string> = new Subject<string>();

  // ─── Inputs públicos ────────────────────────────────────────────────────

  /** Valor controlado desde el padre. */
  readonly value: InputSignal<string> = input<string>('');

  /** Placeholder ya traducido que se pasa directamente al retro-input. */
  readonly placeholder: InputSignal<string> = input<string>('');

  /** Path del comando que se muestra en retro-command-bar. */
  readonly commandPath: InputSignal<string> = input.required<string>();

  /** Flags que se muestran en retro-command-bar. */
  readonly commandFlags: InputSignal<readonly string[]> = input.required<readonly string[]>();

  /** Milisegundos de espera antes de emitir el valor final. */
  readonly debounceMs: InputSignal<number> = input<number>(300);

  /** Si es true, el input queda deshabilitado. */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  // ─── Outputs ────────────────────────────────────────────────────────────

  /** Emite el valor introducido una vez transcurrido el debounce. */
  readonly valueChange: OutputEmitterRef<string> = output<string>();

  // ─── Constructor ────────────────────────────────────────────────────────

  constructor() {
    this._input$
      .pipe(debounceTime(this.debounceMs()), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value: string): void => {
        this.valueChange.emit(value);
      });
  }

  // ─── Métodos públicos ────────────────────────────────────────────────────

  /**
   * Propaga el valor introducido al Subject de debounce.
   *
   * @param {string} value - Nuevo valor del input
   */
  onInput(value: string): void {
    this._input$.next(value);
  }
}
