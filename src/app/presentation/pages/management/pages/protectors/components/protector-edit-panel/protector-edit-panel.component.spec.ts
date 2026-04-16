import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { ProtectorEditPanelComponent } from './protector-edit-panel.component';

// ─────────────────────────────────────────────────────────────────────────────

describe('ProtectorEditPanelComponent — template real', () => {
  let component: ProtectorEditPanelComponent;
  let fixture: ComponentFixture<ProtectorEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        ProtectorEditPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(ProtectorEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('muestra la sección de packs vacía cuando no hay packs', () => {
    expect(component.packsArray.length).toBe(0);
  });

  it('renderiza packs cuando se añaden', () => {
    component.addPack();
    fixture.detectChanges();
    expect(component.packsArray.length).toBe(1);
  });

  it('renderiza modo edición cuando se pasa un protector por input (activo)', () => {
    fixture.componentRef.setInput('protector', {
      id: 'p1',
      name: 'BigBen',
      category: 'console',
      notes: null,
      isActive: true,
      packs: [{ quantity: 1, price: 5, url: null }]
    });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('BigBen');
  });

  it('renderiza modo edición cuando se pasa un protector por input (inactivo)', () => {
    fixture.componentRef.setInput('protector', {
      id: 'p2',
      name: 'CTA',
      category: 'box',
      notes: null,
      isActive: false,
      packs: []
    });
    fixture.detectChanges();
    expect(component.form.getRawValue().name).toBe('CTA');
  });

  it('emite toggled al hacer click en el botón de activar/desactivar', () => {
    fixture.componentRef.setInput('protector', {
      id: 'p1',
      name: 'BigBen',
      category: 'box',
      notes: null,
      isActive: true,
      packs: []
    });
    fixture.detectChanges();
    const spy = vi.spyOn(component.toggled, 'emit');
    const toggleBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[mat-stroked-button]');
    toggleBtn?.click();
    expect(spy).toHaveBeenCalled();
  });

  it('emite deleted al hacer click en el botón de eliminar', () => {
    fixture.componentRef.setInput('protector', {
      id: 'p1',
      name: 'BigBen',
      category: 'box',
      notes: null,
      isActive: true,
      packs: []
    });
    fixture.detectChanges();
    const spy = vi.spyOn(component.deleted, 'emit');
    const deleteBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.edit-panel__delete-btn');
    deleteBtn?.click();
    expect(spy).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('ProtectorEditPanelComponent', () => {
  let component: ProtectorEditPanelComponent;
  let fixture: ComponentFixture<ProtectorEditPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({ imports: [ProtectorEditPanelComponent] });
    TestBed.overrideComponent(ProtectorEditPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(ProtectorEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('form inicial: name vacío, category "box", notes null, packs vacío', () => {
    expect(component.form.getRawValue()).toMatchObject({ name: '', category: 'box', notes: null });
    expect(component.packsArray.length).toBe(0);
  });

  describe('cuando se pasa un protector por input', () => {
    it('rellena el form y los packs del protector', () => {
      fixture.componentRef.setInput('protector', {
        id: 'p1',
        name: 'BigBen',
        category: 'console',
        notes: 'Nota',
        isActive: true,
        packs: [{ quantity: 3, price: 12, url: null }]
      });
      fixture.detectChanges();
      expect(component.form.getRawValue()).toMatchObject({ name: 'BigBen', category: 'console', notes: 'Nota' });
      expect(component.packsArray.length).toBe(1);
    });

    it('limpia packs existentes al cambiar de protector (while loop)', () => {
      fixture.componentRef.setInput('protector', {
        id: 'p1',
        name: 'A',
        category: 'box',
        notes: null,
        isActive: true,
        packs: [{ quantity: 1, price: 5, url: null }]
      });
      fixture.detectChanges();
      expect(component.packsArray.length).toBe(1);

      fixture.componentRef.setInput('protector', {
        id: 'p2',
        name: 'B',
        category: 'console',
        notes: null,
        isActive: false,
        packs: []
      });
      fixture.detectChanges();
      expect(component.packsArray.length).toBe(0);
    });
  });

  describe('addPack / removePack', () => {
    it('addPack añade un pack al array', () => {
      component.addPack();
      expect(component.packsArray.length).toBe(1);
    });

    it('removePack elimina el pack en el índice dado', () => {
      component.addPack();
      component.addPack();
      component.removePack(0);
      expect(component.packsArray.length).toBe(1);
    });
  });

  describe('asFormGroup', () => {
    it('castea correctamente un AbstractControl a FormGroup', () => {
      component.addPack();
      const group = component.asFormGroup(component.packsArray.at(0));
      expect(group.controls['quantity']).toBeDefined();
    });
  });

  describe('onSave', () => {
    it('no emite si no hay packs', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'BigBen', category: 'box' });
      component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });

    it('no emite si el form es inválido (name vacío)', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.addPack();
      component.asFormGroup(component.packsArray.at(0)).patchValue({ quantity: 1, price: 5, url: '' });
      component.form.patchValue({ name: '', category: 'box' });
      component.onSave();
      expect(spy).not.toHaveBeenCalled();
    });

    it('emite el resultado correcto si el form es válido y hay packs', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'BigBen', category: 'console', notes: null });
      component.addPack();
      component
        .asFormGroup(component.packsArray.at(0))
        .patchValue({ quantity: 5, price: 19.99, url: 'https://example.com' });
      component.onSave();
      expect(spy).toHaveBeenCalledWith({
        name: 'BigBen',
        category: 'console',
        notes: null,
        packs: [{ quantity: 5, price: 19.99, url: 'https://example.com' }]
      });
    });

    it('convierte url vacía a null al emitir', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'BigBen', category: 'console', notes: null });
      component.addPack();
      component.asFormGroup(component.packsArray.at(0)).patchValue({ quantity: 1, price: 5, url: '' });
      component.onSave();
      const result = spy.mock.calls[0][0] as any;
      expect(result.packs[0].url).toBeNull();
    });

    it('incluye notes cuando tiene valor', () => {
      const spy = vi.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'BigBen', category: 'console', notes: 'Protetor de lujo' });
      component.addPack();
      component.asFormGroup(component.packsArray.at(0)).patchValue({ quantity: 1, price: 5, url: '' });
      component.onSave();
      const result = spy.mock.calls[0][0] as any;
      expect(result.notes).toBe('Protetor de lujo');
    });
  });
});
