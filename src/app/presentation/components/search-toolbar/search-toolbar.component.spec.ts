import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { SearchToolbarComponent } from './search-toolbar.component';

// ─── Suite principal (template vacío, comportamiento lógico) ─────────────────

describe('SearchToolbarComponent', () => {
  let component: SearchToolbarComponent;
  let fixture: ComponentFixture<SearchToolbarComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [SearchToolbarComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(SearchToolbarComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(SearchToolbarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('commandPath', 'search');
    fixture.componentRef.setInput('commandFlags', []);
    fixture.detectChanges();
  });

  describe('valores iniciales', () => {
    it('value por defecto es ""', () => {
      expect(component.value()).toBe('');
    });

    it('placeholder por defecto es ""', () => {
      expect(component.placeholder()).toBe('');
    });

    it('debounceMs por defecto es 300', () => {
      expect(component.debounceMs()).toBe(300);
    });

    it('disabled por defecto es false', () => {
      expect(component.disabled()).toBe(false);
    });
  });

  describe('debounce — emisión de valueChange', () => {
    it('emite valueChange tras el debounce cuando cambia el valor', () => {
      vi.useFakeTimers();
      try {
        const spy = vi.spyOn(component.valueChange, 'emit');

        component.onInput('zelda');
        vi.advanceTimersByTime(300);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith('zelda');
      } finally {
        vi.useRealTimers();
      }
    });

    it('no re-emite con distinctUntilChanged cuando el mismo valor se envía dos veces', () => {
      vi.useFakeTimers();
      try {
        const spy = vi.spyOn(component.valueChange, 'emit');

        component.onInput('mario');
        vi.advanceTimersByTime(300);
        component.onInput('mario');
        vi.advanceTimersByTime(300);

        expect(spy).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('no emite antes de que transcurra el debounce', () => {
      vi.useFakeTimers();
      try {
        const spy = vi.spyOn(component.valueChange, 'emit');

        component.onInput('sonic');
        vi.advanceTimersByTime(150);

        expect(spy).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it('emite string vacío al hacer reset', () => {
      vi.useFakeTimers();
      try {
        const spy = vi.spyOn(component.valueChange, 'emit');

        component.onInput('mario');
        vi.advanceTimersByTime(300);
        component.onInput('');
        vi.advanceTimersByTime(300);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenLastCalledWith('');
      } finally {
        vi.useRealTimers();
      }
    });
  });
});

// ─── Suite de propagación a retro-command-bar (template real) ────────────────

describe('SearchToolbarComponent — propagación a retro-command-bar', () => {
  let fixture: ComponentFixture<SearchToolbarComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [SearchToolbarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    TestBed.overrideComponent(SearchToolbarComponent, {
      set: {
        imports: [],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        template: `<retro-command-bar [path]="commandPath()" [flags]="commandFlags()"></retro-command-bar>`
      }
    });
    fixture = TestBed.createComponent(SearchToolbarComponent);
    fixture.componentRef.setInput('commandPath', 'search');
    fixture.componentRef.setInput('commandFlags', []);
    fixture.detectChanges();
  });

  it('pasa commandPath al elemento retro-command-bar renderizado', () => {
    fixture.componentRef.setInput('commandPath', 'collection/games');
    fixture.detectChanges();

    const bar = fixture.debugElement.query(By.css('retro-command-bar'));
    expect(bar).not.toBeNull();
    expect(bar.properties['path']).toBe('collection/games');
  });

  it('pasa commandFlags al elemento retro-command-bar renderizado', () => {
    fixture.componentRef.setInput('commandFlags', ['--platform=PC', '--year=2024']);
    fixture.detectChanges();

    const bar = fixture.debugElement.query(By.css('retro-command-bar'));
    expect(bar).not.toBeNull();
    expect(bar.properties['flags']).toEqual(['--platform=PC', '--year=2024']);
  });
});
