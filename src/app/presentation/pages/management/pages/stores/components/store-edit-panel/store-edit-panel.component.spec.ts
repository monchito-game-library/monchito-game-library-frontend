import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { StoreEditPanelComponent } from './store-edit-panel.component';

// ─────────────────────────────────────────────────────────────────────────────

describe('StoreEditPanelComponent — template real', () => {
  let component: StoreEditPanelComponent;
  let fixture: ComponentFixture<StoreEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        StoreEditPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(StoreEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza modo edición cuando se pasa un store por input', () => {
    fixture.componentRef.setInput('store', { id: 's1', label: 'Steam', formatHint: 'digital' });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('Steam');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('StoreEditPanelComponent', () => {
  let component: StoreEditPanelComponent;
  let fixture: ComponentFixture<StoreEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ imports: [StoreEditPanelComponent] });
    TestBed.overrideComponent(StoreEditPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(StoreEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('form inicial: name vacío y formatHint null', () => {
    expect(component.form.getRawValue()).toEqual({ name: '', formatHint: null });
  });

  describe('cuando se pasa un store por input', () => {
    it('rellena el form con name y formatHint del store', () => {
      fixture.componentRef.setInput('store', { id: 's1', label: 'Steam', formatHint: 'digital' });
      fixture.detectChanges();
      expect(component.form.getRawValue()).toEqual({ name: 'Steam', formatHint: 'digital' });
    });
  });

  describe('onSave', () => {
    it('no emite si el form es inválido (name vacío)', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: '' });
      component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });

    it('emite el resultado correcto si el form es válido', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'Amazon', formatHint: 'physical' });
      component.onSave();
      expect(spy).toHaveBeenCalledWith({ label: 'Amazon', formatHint: 'physical' });
    });
  });
});
