import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  InputSignal,
  OnChanges,
  output,
  OutputEmitterRef,
  signal,
  SimpleChanges,
  WritableSignal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TOGGLE_SWITCH_DEFAULT_ICON, TOGGLE_SWITCH_DEFAULT_ICON_CHECKED } from '@/constants/toggle-switch.constant';

@Component({
  selector: 'app-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  styleUrls: ['./toggle-switch.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleSwitchComponent),
      multi: true
    }
  ]
})
export class ToggleSwitchComponent implements ControlValueAccessor, OnChanges {
  /**
   * True once Angular Forms has called registerOnChange, meaning formControlName
   * is in use and [checked] input should no longer drive the internal value.
   */
  private _cvaMode = false;

  /** Whether the toggle is in the checked (on) state. Used in standalone mode (without formControlName). */
  readonly checked: InputSignal<boolean> = input<boolean>(false);

  /** Material icon name displayed when the toggle is unchecked. Defaults to 'remove'. */
  readonly icon: InputSignal<string> = input<string>(TOGGLE_SWITCH_DEFAULT_ICON);

  /** Material icon name displayed when the toggle is checked. Defaults to 'check'. */
  readonly iconChecked: InputSignal<string> = input<string>(TOGGLE_SWITCH_DEFAULT_ICON_CHECKED);

  /** Whether the toggle is non-interactive. Used in standalone mode. CVA uses setDisabledState instead. */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /** Emits the new boolean state after each user interaction. */
  readonly changed: OutputEmitterRef<boolean> = output<boolean>();

  /** Internal value signal — driven by [checked] input (standalone) or writeValue (CVA). */
  readonly _value: WritableSignal<boolean> = signal(false);

  /** Internal disabled signal — driven by [disabled] input (standalone) or setDisabledState (CVA). */
  readonly _isDisabled: WritableSignal<boolean> = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['checked'] && !this._cvaMode) {
      this._value.set(changes['checked'].currentValue ?? false);
    }
    if (changes['disabled']) {
      this._isDisabled.set(changes['disabled'].currentValue ?? false);
    }
  }

  /**
   * Called by Angular Forms to push a new value into the component.
   *
   * @param {boolean} value - Nuevo valor del toggle
   */
  writeValue(value: boolean): void {
    this._value.set(value ?? false);
  }

  /**
   * Registers the callback Angular Forms uses to get notified of value changes.
   *
   * @param {(value: boolean) => void} fn
   */
  registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
    this._cvaMode = true;
  }

  /**
   * Registers the callback Angular Forms uses to mark the control as touched.
   *
   * @param {() => void} fn
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /**
   * Called by Angular Forms when the disabled state of the control changes.
   *
   * @param {boolean} isDisabled - Si el componente debe deshabilitarse
   */
  setDisabledState(isDisabled: boolean): void {
    this._isDisabled.set(isDisabled);
  }

  /**
   * Handles the click event, toggles the internal value, and notifies Angular Forms and the parent.
   * Does nothing if the toggle is disabled.
   */
  onToggle(): void {
    if (this._isDisabled()) return;
    const newValue = !this._value();
    this._value.set(newValue);
    this._onChange(newValue);
    this._onTouched();
    this.changed.emit(newValue);
  }

  /**
   * Returns the icon name to display based on the current internal state.
   */
  getIcon(): string {
    return this._value() ? this.iconChecked() : this.icon();
  }

  private _onChange: (value: boolean) => void = () => {};
  private _onTouched: () => void = () => {};
}
