import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { HardwareBrandEditPanelComponent } from './hardware-brand-edit-panel.component';

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareBrandEditPanelComponent — template real', () => {
  let component: HardwareBrandEditPanelComponent;
  let fixture: ComponentFixture<HardwareBrandEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        HardwareBrandEditPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HardwareBrandEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('rellena el form cuando se pasa una brand por input', () => {
    fixture.componentRef.setInput('brand', { id: 'brand-uuid-1', name: 'Sony' });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('Sony');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareBrandEditPanelComponent', () => {
  let component: HardwareBrandEditPanelComponent;
  let fixture: ComponentFixture<HardwareBrandEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ imports: [HardwareBrandEditPanelComponent] });
    TestBed.overrideComponent(HardwareBrandEditPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(HardwareBrandEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('form inicial: name vacío', () => {
    expect(component.form.getRawValue()).toEqual({ name: '' });
  });

  describe('cuando se pasa una brand por input', () => {
    it('rellena el form con el nombre de la brand', () => {
      fixture.componentRef.setInput('brand', { id: 'brand-uuid-1', name: 'Microsoft' });
      fixture.detectChanges();
      expect(component.form.getRawValue()).toEqual({ name: 'Microsoft' });
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
      component.form.patchValue({ name: 'Nintendo' });
      component.onSave();
      expect(spy).toHaveBeenCalledWith({ name: 'Nintendo' });
    });
  });
});
