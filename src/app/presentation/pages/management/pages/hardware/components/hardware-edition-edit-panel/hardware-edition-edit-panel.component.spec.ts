import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { HardwareEditionEditPanelComponent } from './hardware-edition-edit-panel.component';

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareEditionEditPanelComponent — template real', () => {
  let component: HardwareEditionEditPanelComponent;
  let fixture: ComponentFixture<HardwareEditionEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        HardwareEditionEditPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HardwareEditionEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('rellena el form cuando se pasa una edition por input', () => {
    fixture.componentRef.setInput('edition', {
      id: 'edition-uuid-1',
      modelId: 'model-uuid-1',
      name: 'God of War Edition'
    });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('God of War Edition');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HardwareEditionEditPanelComponent', () => {
  let component: HardwareEditionEditPanelComponent;
  let fixture: ComponentFixture<HardwareEditionEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ imports: [HardwareEditionEditPanelComponent] });
    TestBed.overrideComponent(HardwareEditionEditPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(HardwareEditionEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('form inicial: name vacío', () => {
    expect(component.form.getRawValue()).toEqual({ name: '' });
  });

  describe('cuando se pasa una edition por input', () => {
    it('rellena el form con el nombre de la edition', () => {
      fixture.componentRef.setInput('edition', {
        id: 'edition-uuid-1',
        modelId: 'model-uuid-1',
        name: 'Astro Bot Edition'
      });
      fixture.detectChanges();
      expect(component.form.getRawValue()).toEqual({ name: 'Astro Bot Edition' });
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
      component.form.patchValue({ name: 'Spider-Man Edition' });
      component.onSave();
      expect(spy).toHaveBeenCalledWith({ name: 'Spider-Man Edition' });
    });
  });
});
