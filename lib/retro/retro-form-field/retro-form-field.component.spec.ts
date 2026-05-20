import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { describe, beforeEach, expect, it } from 'vitest';

import { RetroFormFieldComponent } from './retro-form-field.component';
import { RetroInputDirective } from './components/retro-input/retro-input.directive';
import { RETRO_FORM_FIELD_CONTROL, RetroFormFieldControl } from './tokens/retro-form-field-control.token';

// ── Host para pruebas básicas (sin control) ──────────────────────────────────

@Component({
  standalone: true,
  imports: [RetroFormFieldComponent],
  template: `<retro-form-field [size]="size">contenido</retro-form-field>`,
  schemas: [NO_ERRORS_SCHEMA]
})
class BasicHostComponent {
  size: 'sm' | 'md' | 'lg' = 'lg';
}

// ── Host para pruebas con RetroInputDirective (retrocompatibilidad) ───────────

@Component({
  standalone: true,
  imports: [RetroFormFieldComponent, RetroInputDirective],
  template: `
    <retro-form-field>
      <input retroInput type="text" />
    </retro-form-field>
  `,
  schemas: [NO_ERRORS_SCHEMA]
})
class WithRetroInputHostComponent {}

// ── Host para pruebas con token genérico (control custom) ────────────────────

/** Control stub que implementa RetroFormFieldControl para tests. */
@Component({
  standalone: true,
  selector: 'app-stub-control',
  template: `<ng-content />`,
  providers: [{ provide: RETRO_FORM_FIELD_CONTROL, useExisting: StubControlComponent }]
})
class StubControlComponent implements RetroFormFieldControl {
  readonly focusSubject: Subject<boolean> = new Subject<boolean>();
  readonly focused$ = this.focusSubject.asObservable();
  errorState = false;
  disabled = false;
  empty = true;
}

@Component({
  standalone: true,
  imports: [RetroFormFieldComponent, StubControlComponent],
  template: `
    <retro-form-field>
      <app-stub-control />
    </retro-form-field>
  `,
  schemas: [NO_ERRORS_SCHEMA]
})
class WithTokenHostComponent {}

// ── Specs ─────────────────────────────────────────────────────────────────────

describe('RetroFormFieldComponent', () => {
  // ── Pruebas básicas (sin control) ──────────────────────────────────────────

  describe('estado inicial', () => {
    let component: RetroFormFieldComponent;
    let fixture: ComponentFixture<BasicHostComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [BasicHostComponent]
      });

      fixture = TestBed.createComponent(BasicHostComponent);
      fixture.detectChanges();
      component = fixture.debugElement.query(By.directive(RetroFormFieldComponent)).componentInstance;
    });

    it('se crea correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('focused() inicia en false', () => {
      expect(component.focused()).toBe(false);
    });

    it('invalid() inicia en false', () => {
      expect(component.invalid()).toBe(false);
    });
  });

  // ── Pruebas de tamaños ────────────────────────────────────────────────────

  describe('size', () => {
    let fixture: ComponentFixture<BasicHostComponent>;
    let host: BasicHostComponent;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [BasicHostComponent]
      });

      fixture = TestBed.createComponent(BasicHostComponent);
      fixture.detectChanges();
      host = fixture.componentInstance;
    });

    it('aplica la clase retro-form-field--size-lg por defecto', () => {
      const el: HTMLElement = fixture.nativeElement.querySelector('.retro-form-field');
      expect(el.classList).toContain('retro-form-field--size-lg');
      expect(el.classList).not.toContain('retro-form-field--size-sm');
      expect(el.classList).not.toContain('retro-form-field--size-md');
    });

    it('aplica la clase retro-form-field--size-sm cuando size="sm"', () => {
      host.size = 'sm';
      fixture.changeDetectorRef.detectChanges();
      fixture.changeDetectorRef.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('.retro-form-field');
      expect(el.classList).toContain('retro-form-field--size-sm');
      expect(el.classList).not.toContain('retro-form-field--size-md');
      expect(el.classList).not.toContain('retro-form-field--size-lg');
    });

    it('aplica la clase retro-form-field--size-md cuando size="md"', () => {
      host.size = 'md';
      fixture.changeDetectorRef.detectChanges();
      fixture.changeDetectorRef.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('.retro-form-field');
      expect(el.classList).toContain('retro-form-field--size-md');
      expect(el.classList).not.toContain('retro-form-field--size-sm');
      expect(el.classList).not.toContain('retro-form-field--size-lg');
    });

    it('aplica la clase retro-form-field--size-lg cuando size="lg"', () => {
      host.size = 'lg';
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('.retro-form-field');
      expect(el.classList).toContain('retro-form-field--size-lg');
    });
  });

  // ── Pruebas de detección por token (control genérico) ────────────────────

  describe('detección por token RETRO_FORM_FIELD_CONTROL', () => {
    let fixture: ComponentFixture<WithTokenHostComponent>;
    let formField: RetroFormFieldComponent;
    let stubControl: StubControlComponent;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [WithTokenHostComponent]
      });

      fixture = TestBed.createComponent(WithTokenHostComponent);
      fixture.detectChanges();

      formField = fixture.debugElement.query(By.directive(RetroFormFieldComponent)).componentInstance;
      stubControl = fixture.debugElement.query(By.directive(StubControlComponent)).componentInstance;
    });

    it('descubre el control proyectado vía el token', () => {
      expect(formField).toBeTruthy();
      expect(stubControl).toBeTruthy();
    });

    it('actualiza focused() a true cuando el control emite foco', () => {
      stubControl.focusSubject.next(true);
      fixture.detectChanges();
      expect(formField.focused()).toBe(true);
    });

    it('actualiza focused() a false cuando el control pierde el foco', () => {
      stubControl.focusSubject.next(true);
      fixture.detectChanges();
      stubControl.focusSubject.next(false);
      fixture.detectChanges();
      expect(formField.focused()).toBe(false);
    });

    it('actualiza invalid() basándose en errorState del control', () => {
      stubControl.errorState = true;
      stubControl.focusSubject.next(true); // dispara la actualización vía focus
      fixture.detectChanges();
      expect(formField.invalid()).toBe(true);
    });
  });

  // ── Pruebas de modo multiline ─────────────────────────────────────────────

  describe('multiline mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RetroFormFieldComponent]
      });
    });

    it('no aplica la clase retro-form-field--multiline por defecto', () => {
      const fixture: ComponentFixture<RetroFormFieldComponent> = TestBed.createComponent(RetroFormFieldComponent);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('.retro-form-field');
      expect(el.classList).not.toContain('retro-form-field--multiline');
    });

    it('aplica la clase retro-form-field--multiline cuando multiline=true', () => {
      const fixture: ComponentFixture<RetroFormFieldComponent> = TestBed.createComponent(RetroFormFieldComponent);
      fixture.componentRef.setInput('multiline', true);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('.retro-form-field');
      expect(el.classList).toContain('retro-form-field--multiline');
    });
  });

  // ── Pruebas de retrocompatibilidad con RetroInputDirective ───────────────

  describe('retrocompatibilidad con retroInput', () => {
    let fixture: ComponentFixture<WithRetroInputHostComponent>;
    let formField: RetroFormFieldComponent;
    let inputDirective: RetroInputDirective;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [WithRetroInputHostComponent]
      });

      fixture = TestBed.createComponent(WithRetroInputHostComponent);
      fixture.detectChanges();

      formField = fixture.debugElement.query(By.directive(RetroFormFieldComponent)).componentInstance;
      inputDirective = fixture.debugElement.query(By.directive(RetroInputDirective)).injector.get(RetroInputDirective);
    });

    it('detecta RetroInputDirective a través del token', () => {
      expect(formField).toBeTruthy();
      expect(inputDirective).toBeTruthy();
    });

    it('actualiza focused() cuando el input nativo recibe foco', () => {
      const inputEl: HTMLElement = fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(formField.focused()).toBe(true);
    });

    it('actualiza focused() a false cuando el input nativo pierde el foco', () => {
      const inputEl: HTMLElement = fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      inputEl.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(formField.focused()).toBe(false);
    });
  });
});
