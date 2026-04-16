import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { HardwareModelEditPanelComponent } from './hardware-model-edit-panel.component';

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareModelEditPanelComponent — template real', () => {
  let component: HardwareModelEditPanelComponent;
  let fixture: ComponentFixture<HardwareModelEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        HardwareModelEditPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HardwareModelEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('rellena el form cuando se pasa un modelo por input', () => {
    fixture.componentRef.setInput('model', {
      id: 'model-uuid-1',
      brandId: 'brand-uuid-1',
      name: 'Xbox Series X',
      type: 'console',
      generation: 9
    });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('Xbox Series X');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareModelEditPanelComponent', () => {
  let component: HardwareModelEditPanelComponent;
  let fixture: ComponentFixture<HardwareModelEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ imports: [HardwareModelEditPanelComponent] });
    TestBed.overrideComponent(HardwareModelEditPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(HardwareModelEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('form inicial: name vacío, type console', () => {
    expect(component.form.getRawValue().name).toBe('');
    expect(component.form.getRawValue().type).toBe('console');
  });

  describe('isConsole (computed signal)', () => {
    it('es true cuando el type es "console"', () => {
      component.form.controls.type.setValue('console');
      expect(component.isConsole()).toBe(true);
    });

    it('es false cuando el type es "controller"', () => {
      component.form.controls.type.setValue('controller');
      expect(component.isConsole()).toBe(false);
    });
  });

  describe('cuando se pasa un modelo por input', () => {
    it('rellena el form con el nombre del modelo', () => {
      fixture.componentRef.setInput('model', {
        id: 'm1',
        brandId: 'b1',
        name: 'Nintendo Switch',
        type: 'console',
        generation: 8
      });
      fixture.detectChanges();
      expect(component.form.getRawValue().name).toBe('Nintendo Switch');
      expect(component.form.getRawValue().generation).toBe(8);
    });
  });

  describe('onSave', () => {
    it('no emite si el form es inválido (name vacío)', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: '', type: 'controller' });
      component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });

    it('no emite si type es console y launchYear es null', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'PS5', type: 'console', launchYear: null });
      component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });

    it('emite el resultado correcto para type controller', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'DualSense', type: 'controller', generation: 5 });
      component.onSave();
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'DualSense', type: 'controller', specs: null }));
    });

    it('emite el resultado correcto para type console con launchYear', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({
        name: 'PS5',
        type: 'console',
        generation: 9,
        launchYear: 2020,
        category: 'home',
        media: 'optical_disc'
      });
      component.onSave();
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'PS5', type: 'console', specs: expect.objectContaining({ launchYear: 2020 }) })
      );
    });
  });
});
