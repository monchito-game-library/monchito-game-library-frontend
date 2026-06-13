import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RetroSearchComponent } from './retro-search.component';
import { RetroOptionComponent } from '../retro-select/components/retro-option/retro-option.component';

// ── Host con opciones proyectadas ────────────────────────────────────────────

@Component({
  selector: 'app-search-host',
  standalone: true,
  imports: [RetroSearchComponent, RetroOptionComponent, ReactiveFormsModule],
  template: `
    <retro-search [label]="'Plataforma'" [formControl]="control">
      <retro-option value="ps5">PlayStation 5</retro-option>
      <retro-option value="xbox">Xbox Series X</retro-option>
      <retro-option value="disabled" [disabled]="true">Deshabilitada</retro-option>
    </retro-search>
  `
})
class SearchHostComponent {
  control = new FormControl<string | null>(null);
}

describe('RetroSearchComponent (unitario)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [RetroSearchComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('se crea correctamente', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('_isDisabled inicia en false', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance._isDisabled()).toBe(false);
  });

  it('_displayValue inicia vacío', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance._displayValue()).toBe('');
  });

  it('writeValue con valor actualiza _displayValue usando displayWith', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('displayWith', (v: string) => `Opción: ${v}`);
    fixture.componentInstance.writeValue('ps5');
    expect(fixture.componentInstance._displayValue()).toBe('Opción: ps5');
    expect(fixture.componentInstance._selectedValue()).toBe('ps5');
  });

  it('writeValue sin displayWith convierte el valor a string', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue('ps5');
    expect(fixture.componentInstance._displayValue()).toBe('ps5');
  });

  it('writeValue con null limpia _displayValue', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance._displayValue()).toBe('');
    expect(fixture.componentInstance._selectedValue()).toBeNull();
  });

  it('writeValue con undefined trata como null', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue(undefined);
    expect(fixture.componentInstance._displayValue()).toBe('');
    expect(fixture.componentInstance._selectedValue()).toBeNull();
  });

  it('setDisabledState actualiza _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance._isDisabled()).toBe(true);
  });

  it('empty es true cuando no hay valor ni texto', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.empty).toBe(true);
  });

  it('empty es false cuando hay texto en _displayValue', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance._displayValue.set('algo');
    expect(fixture.componentInstance.empty).toBe(false);
  });

  it('onClear limpia el estado y emite cleared', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.writeValue('algo');
    let clearEmitted = false;
    fixture.componentInstance.cleared.subscribe(() => (clearEmitted = true));
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance._displayValue()).toBe('');
    expect(fixture.componentInstance._selectedValue()).toBeNull();
    expect(clearEmitted).toBe(true);
  });

  it('onClear llama onChange y onTouched', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    const changeFn = vi.fn();
    const touchedFn = vi.fn();
    fixture.componentInstance.registerOnChange(changeFn);
    fixture.componentInstance.registerOnTouched(touchedFn);
    fixture.componentInstance.onClear();
    expect(changeFn).toHaveBeenCalledWith(null);
    expect(touchedFn).toHaveBeenCalled();
  });

  it('errorState es false sin NgControl', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance.errorState).toBe(false);
  });

  it('disabled getter devuelve _isDisabled', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance.disabled).toBe(true);
  });

  it('onFocus emite true al subject de foco', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    let emitted: boolean | undefined;
    fixture.componentInstance.focused$.subscribe((v) => (emitted = v));
    fixture.componentInstance.onFocus();
    expect(emitted).toBe(true);
  });

  it('onFocus emite queryChange si la longitud supera minChars', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentInstance._displayValue.set('ps5');
    let emittedQuery: string | undefined;
    fixture.componentInstance.queryChange.subscribe((v) => (emittedQuery = v));
    fixture.componentInstance.onFocus();
    expect(emittedQuery).toBe('ps5');
  });

  it('onFocus no emite queryChange si la longitud no supera minChars', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('minChars', 3);
    fixture.componentInstance._displayValue.set('p');
    let emittedQuery: string | undefined;
    fixture.componentInstance.queryChange.subscribe((v) => (emittedQuery = v));
    fixture.componentInstance.onFocus();
    expect(emittedQuery).toBeUndefined();
  });

  it('onInput actualiza _displayValue y emite queryChange', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    let emittedQuery = '';
    fixture.componentInstance.queryChange.subscribe((v) => (emittedQuery = v));
    const event = { target: { value: 'play' } } as unknown as Event;
    fixture.componentInstance.onInput(event);
    expect(fixture.componentInstance._displayValue()).toBe('play');
    expect(emittedQuery).toBe('play');
  });

  it('onInput cierra el panel cuando la longitud es menor que minChars', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('minChars', 3);
    // Simular que el panel está abierto
    (fixture.componentInstance as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    const event = { target: { value: 'p' } } as unknown as Event;
    fixture.componentInstance.onInput(event);
    expect(fixture.componentInstance._panelOpen()).toBe(false);
  });

  it('onKeydown con ArrowDown abre el panel si está cerrado', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    // Panel cerrado → no hay overlayRef
    fixture.componentInstance.onKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onKeydown con ArrowUp cuando el panel está cerrado intenta abrir', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('onKeydown con Escape cierra el panel si está abierto', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    (fixture.componentInstance as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
    expect(fixture.componentInstance._panelOpen()).toBe(false);
  });

  it('onKeydown con Escape no hace nada si el panel está cerrado', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    (fixture.componentInstance as any)._overlayRef = null;
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onKeydown(event);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('onKeydown con Enter cuando el panel está cerrado no hace nada', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    (fixture.componentInstance as any)._overlayRef = null;
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fixture.componentInstance.onKeydown(event);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('ngOnDestroy llama dispose del overlayRef si existe', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    const disposeSpy = vi.fn();
    (fixture.componentInstance as any)._overlayRef = { dispose: disposeSpy };
    fixture.componentInstance.ngOnDestroy();
    expect(disposeSpy).toHaveBeenCalled();
  });

  it('ngOnDestroy no falla si no hay overlayRef', () => {
    const fixture = TestBed.createComponent(RetroSearchComponent);
    fixture.componentRef.setInput('label', 'Test');
    (fixture.componentInstance as any)._overlayRef = null;
    expect(() => fixture.componentInstance.ngOnDestroy()).not.toThrow();
  });
});

describe('RetroSearchComponent (integración con opciones)', () => {
  let fixture: ComponentFixture<SearchHostComponent>;
  let host: SearchHostComponent;
  let search: RetroSearchComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [SearchHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    search = fixture.debugElement.query(
      (el) => el.componentInstance instanceof RetroSearchComponent
    )?.componentInstance;
  });

  it('se crea el host correctamente', () => {
    expect(host).toBeTruthy();
  });

  it('writeValue desde formControl actualiza _selectedValue', () => {
    host.control.setValue('ps5');
    fixture.detectChanges();
    expect(search._selectedValue()).toBe('ps5');
  });

  it('setDisabledState via formControl actualiza _isDisabled', () => {
    host.control.disable();
    fixture.detectChanges();
    expect(search._isDisabled()).toBe(true);
    host.control.enable();
    fixture.detectChanges();
    expect(search._isDisabled()).toBe(false);
  });

  it('errorState es true cuando el control es inválido y tocado', () => {
    host.control.setValidators(() => ({ required: true }));
    host.control.markAsTouched();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(search.errorState).toBe(true);
  });

  it('selectOption actualiza el valor y emite optionSelected', () => {
    fixture.detectChanges();
    let emittedValue: unknown;
    search.optionSelected.subscribe((v) => (emittedValue = v));
    // Crear opción mockeada
    const mockOption = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PlayStation 5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    // Inyectar en el QueryList para que _closePanel no falle
    (search as any)._options = { toArray: () => [], forEach: vi.fn() };
    (search as any)._overlayRef = null;
    search.selectOption(mockOption);
    expect(search._selectedValue()).toBe('ps5');
    expect(emittedValue).toBe('ps5');
  });

  it('onKeydown con Enter cuando el panel está abierto y hay opción activa selecciona', () => {
    fixture.detectChanges();
    const mockOption = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PlayStation 5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [mockOption],
      forEach: (fn: (o: RetroOptionComponent) => void) => [mockOption].forEach(fn),
      length: 1
    };

    (search as any)._options = mockQueryList;
    (search as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    (search as any)._activeIndex = 0;

    let emittedValue: unknown;
    search.optionSelected.subscribe((v) => (emittedValue = v));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    search.onKeydown(event);

    expect(search._selectedValue()).toBe('ps5');
    expect(emittedValue).toBe('ps5');
  });

  it('onKeydown con ArrowDown cuando el panel está abierto mueve el foco', () => {
    fixture.detectChanges();
    const mockOpt1 = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PS5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    const mockOpt2 = {
      value: () => 'xbox',
      isDisabled: () => false,
      getLabel: () => 'Xbox',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-2'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [mockOpt1, mockOpt2],
      forEach: (fn: (o: RetroOptionComponent) => void) => [mockOpt1, mockOpt2].forEach(fn),
      length: 2
    };

    (search as any)._options = mockQueryList;
    (search as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    (search as any)._activeIndex = -1;

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    search.onKeydown(event);
    expect((search as any)._activeIndex).toBe(0);
  });

  it('onKeydown con ArrowDown salta opciones deshabilitadas', () => {
    fixture.detectChanges();
    const mockOpt1 = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PS5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    const mockOpt2 = {
      value: () => 'xbox',
      isDisabled: () => false,
      getLabel: () => 'Xbox',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-2'
    } as unknown as RetroOptionComponent;
    const mockOptDisabled = {
      value: () => 'disabled',
      isDisabled: () => true,
      getLabel: () => 'Disabled',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-3'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [mockOpt1, mockOpt2, mockOptDisabled],
      forEach: (fn: (o: RetroOptionComponent) => void) => [mockOpt1, mockOpt2, mockOptDisabled].forEach(fn),
      length: 3
    };

    (search as any)._options = mockQueryList;
    (search as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    (search as any)._activeIndex = 1; // posicionado en xbox

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    search.onKeydown(event);
    // La opción de índice 2 (disabled) se salta, no avanza más allá
    expect((search as any)._activeIndex).toBe(1);
  });

  it('onBlur con overlayRef activo no llama onTouched', async () => {
    (search as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    const fn = vi.fn();
    search.registerOnTouched(fn);
    search.onBlur();
    // El timeout es de 150ms; con el overlayRef activo no debería llamar onTouched
    await new Promise((r) => setTimeout(r, 200));
    expect(fn).not.toHaveBeenCalled();
  });

  it('onBlur sin overlayRef llama onTouched después del timeout', async () => {
    (search as any)._overlayRef = null;
    const fn = vi.fn();
    search.registerOnTouched(fn);
    search.onBlur();
    await new Promise((r) => setTimeout(r, 200));
    expect(fn).toHaveBeenCalled();
  });

  it('onBlur + destroy inmediato no ejecuta el callback del timeout', async () => {
    (search as any)._overlayRef = null;
    const fn = vi.fn();
    search.registerOnTouched(fn);
    // Espiar _onTouchedCallback para detectar ejecución tras destroy
    const spy = vi.spyOn(search as any, '_onTouchedCallback');
    search.onBlur();
    // Destroy antes de que expire el timeout de 150ms
    search.ngOnDestroy();
    await new Promise((r) => setTimeout(r, 200));
    expect(spy).not.toHaveBeenCalled();
  });

  it('onKeydown Escape cuando el panel está cerrado no lanza error', () => {
    (search as any)._overlayRef = null;
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    expect(() => search.onKeydown(event)).not.toThrow();
  });

  it('_selectActive con opción disabled no emite selección', () => {
    const disabledOpt = {
      value: () => 'disabled',
      isDisabled: () => true,
      getLabel: () => 'Disabled',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [disabledOpt],
      forEach: vi.fn(),
      length: 1
    };
    (search as any)._options = mockQueryList;
    (search as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    (search as any)._activeIndex = 0;

    const spy = vi.fn();
    search.optionSelected.subscribe(spy);

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    search.onKeydown(event);
    expect(spy).not.toHaveBeenCalled();
  });

  it('errorState es true cuando el control es inválido y dirty (no touched)', () => {
    host.control.setValidators(() => ({ required: true }));
    host.control.markAsDirty();
    host.control.updateValueAndValidity();
    fixture.detectChanges();
    expect(search.errorState).toBe(true);
  });

  it('onClear cierra el panel antes de emitir callbacks (M10)', () => {
    const callOrder: string[] = [];
    // Simular panel abierto con overlayRef mock
    const mockOverlayRef = {
      detach: vi.fn(() => callOrder.push('detach')),
      dispose: vi.fn(() => callOrder.push('dispose'))
    };
    (search as any)._overlayRef = mockOverlayRef;
    (search as any)._options = { toArray: () => [], forEach: vi.fn(), length: 0 };
    const changeFn = vi.fn(() => callOrder.push('onChange'));
    const touchedFn = vi.fn(() => callOrder.push('onTouched'));
    search.registerOnChange(changeFn);
    search.registerOnTouched(touchedFn);
    search.writeValue('ps5');
    search.onClear();
    // dispose debe ocurrir antes de onChange y onTouched
    const disposeIdx = callOrder.indexOf('dispose');
    const onChangeIdx = callOrder.indexOf('onChange');
    expect(disposeIdx).toBeGreaterThanOrEqual(0);
    expect(onChangeIdx).toBeGreaterThanOrEqual(0);
    expect(disposeIdx).toBeLessThan(onChangeIdx);
  });

  it('onKeydown con Home activa la primera opción (L5)', () => {
    fixture.detectChanges();
    const mockOpt1 = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PS5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    const mockOpt2 = {
      value: () => 'xbox',
      isDisabled: () => false,
      getLabel: () => 'Xbox',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-2'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [mockOpt1, mockOpt2],
      forEach: (fn: (o: RetroOptionComponent) => void) => [mockOpt1, mockOpt2].forEach(fn),
      length: 2
    };
    (search as any)._options = mockQueryList;
    (search as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    (search as any)._activeIndex = 1;
    const event = new KeyboardEvent('keydown', { key: 'Home' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    search.onKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
    expect((search as any)._activeIndex).toBe(0);
    expect(mockOpt1.setActive).toHaveBeenCalledWith(true);
  });

  it('onKeydown con End activa la última opción (L5)', () => {
    fixture.detectChanges();
    const mockOpt1 = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PS5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    const mockOpt2 = {
      value: () => 'xbox',
      isDisabled: () => false,
      getLabel: () => 'Xbox',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-2'
    } as unknown as RetroOptionComponent;
    const mockQueryList = {
      toArray: () => [mockOpt1, mockOpt2],
      forEach: (fn: (o: RetroOptionComponent) => void) => [mockOpt1, mockOpt2].forEach(fn),
      length: 2
    };
    (search as any)._options = mockQueryList;
    (search as any)._overlayRef = { detach: vi.fn(), dispose: vi.fn() };
    (search as any)._activeIndex = 0;
    const event = new KeyboardEvent('keydown', { key: 'End' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    search.onKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
    expect((search as any)._activeIndex).toBe(1);
    expect(mockOpt2.setActive).toHaveBeenCalledWith(true);
  });

  it('_syncSelectedLabel actualiza _displayValue al cambiar opciones con displayWith (M9)', () => {
    fixture.detectChanges();
    const displayFn = (v: unknown): string => `Label:${v}`;
    // Patchear directamente la función displayWith a través del input signal
    // usando el mismo mecanismo que writeValue usa para resolverla
    const origDisplayWith = search.displayWith;
    Object.defineProperty(search, 'displayWith', { value: () => displayFn, configurable: true });
    search.writeValue('ps5');
    (search as any)._syncSelectedLabel();
    Object.defineProperty(search, 'displayWith', { value: origDisplayWith, configurable: true });
    expect(search._displayValue()).toBe('Label:ps5');
  });

  it('_syncSelectedLabel actualiza _displayValue desde opción coincidente sin displayWith (M9)', () => {
    fixture.detectChanges();
    search.writeValue('ps5');
    const matchOpt = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PlayStation 5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    (search as any)._options = {
      find: (fn: (o: RetroOptionComponent) => boolean) => [matchOpt].find(fn),
      forEach: vi.fn(),
      length: 1
    };
    (search as any)._syncSelectedLabel();
    expect(search._displayValue()).toBe('PlayStation 5');
  });

  it('_syncSelectedLabel no modifica _displayValue si no hay valor seleccionado (M9)', () => {
    fixture.detectChanges();
    search.writeValue(null);
    search._displayValue.set('texto previo');
    (search as any)._syncSelectedLabel();
    expect(search._displayValue()).toBe('texto previo');
  });

  it('_userEditing activo: _syncSelectedLabel no sobreescribe _displayValue mientras el usuario edita', () => {
    fixture.detectChanges();
    // Seleccionar un valor inicial para que _syncSelectedLabel tenga algo que sincronizar
    search.writeValue('ps5');
    // Simular que el usuario empieza a editar el input
    const event = { target: { value: 'play' } } as unknown as Event;
    search.onInput(event);
    // En este punto _userEditing es true y _displayValue es 'play'
    expect(search._displayValue()).toBe('play');

    // Simular que llegan opciones nuevas y _syncSelectedLabel se ejecuta
    const matchOpt = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PlayStation 5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    (search as any)._options = {
      find: (fn: (o: RetroOptionComponent) => boolean) => [matchOpt].find(fn),
      forEach: vi.fn(),
      length: 1
    };

    // _syncSelectedLabel NO debe reemplazar 'play' porque el usuario está editando
    (search as any)._syncSelectedLabel();
    expect(search._displayValue()).toBe('play');
  });

  it('_userEditing desactivado por onClear: _syncSelectedLabel sí actualiza _displayValue', () => {
    fixture.detectChanges();
    search.writeValue('ps5');
    // Simular edición
    const event = { target: { value: 'play' } } as unknown as Event;
    search.onInput(event);

    // onClear resetea _userEditing a false
    (search as any)._overlayRef = null;
    (search as any)._options = { toArray: () => [], forEach: vi.fn(), length: 0 };
    search.onClear();

    // Ahora escribir de nuevo un valor seleccionado
    search.writeValue('ps5');
    const matchOpt = {
      value: () => 'ps5',
      isDisabled: () => false,
      getLabel: () => 'PlayStation 5',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-1'
    } as unknown as RetroOptionComponent;
    (search as any)._options = {
      find: (fn: (o: RetroOptionComponent) => boolean) => [matchOpt].find(fn),
      forEach: vi.fn(),
      length: 1
    };

    // Forzar _displayValue a '' para comprobar que _syncSelectedLabel lo restaura
    search._displayValue.set('');
    (search as any)._syncSelectedLabel();
    // _userEditing es false → debe actualizar _displayValue con el label de la opción
    expect(search._displayValue()).toBe('PlayStation 5');
  });

  it('_userEditing desactivado por selectOption: _syncSelectedLabel sí actualiza _displayValue', () => {
    fixture.detectChanges();
    search.writeValue('ps5');
    // Simular edición
    const event = { target: { value: 'xbo' } } as unknown as Event;
    search.onInput(event);
    expect((search as any)._userEditing).toBe(true);

    // Seleccionar una opción — esto llama a _emitSelected que pone _userEditing = false
    const mockOption = {
      value: () => 'xbox',
      isDisabled: () => false,
      getLabel: () => 'Xbox Series X',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-xbox'
    } as unknown as RetroOptionComponent;
    (search as any)._options = { toArray: () => [], forEach: vi.fn(), length: 0 };
    (search as any)._overlayRef = null;
    search.selectOption(mockOption);
    expect((search as any)._userEditing).toBe(false);

    // _syncSelectedLabel ahora sí debe actualizar _displayValue
    search.writeValue('xbox');
    const matchOpt = {
      value: () => 'xbox',
      isDisabled: () => false,
      getLabel: () => 'Xbox Series X',
      setActive: vi.fn(),
      setSelected: vi.fn(),
      id: 'opt-xbox'
    } as unknown as RetroOptionComponent;
    (search as any)._options = {
      find: (fn: (o: RetroOptionComponent) => boolean) => [matchOpt].find(fn),
      forEach: vi.fn(),
      length: 1
    };
    search._displayValue.set('');
    (search as any)._syncSelectedLabel();
    expect(search._displayValue()).toBe('Xbox Series X');
  });
});
