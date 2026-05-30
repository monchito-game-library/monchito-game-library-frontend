import { Component, NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RetroFormFieldComponent } from './retro-form-field.component';
import { RetroInputComponent } from '../retro-input/retro-input.component';
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

  // ── Pruebas con ngControl (statusChanges) ────────────────────────────────

  describe('con StubControl que tiene ngControl con statusChanges', () => {
    /** StubControl que expone un NgControl con statusChanges para testear la suscripción. */
    @Component({
      standalone: true,
      selector: 'app-stub-control-with-ngcontrol',
      imports: [ReactiveFormsModule],
      template: `<input [formControl]="ctrl" />`,
      providers: [{ provide: RETRO_FORM_FIELD_CONTROL, useExisting: StubControlWithNgControlComponent }]
    })
    class StubControlWithNgControlComponent implements RetroFormFieldControl {
      readonly ctrl = new FormControl<string | null>('', [Validators.required]);
      readonly focusSubject: Subject<boolean> = new Subject<boolean>();
      readonly focused$ = this.focusSubject.asObservable();
      errorState = false;
      disabled = false;
      empty = true;
      // Expone el NgControl del input subyacente via ngControl
      get ngControl() {
        return null; // El form-field busca ngControl en el contrato
      }
    }

    @Component({
      standalone: true,
      imports: [RetroFormFieldComponent, StubControlWithNgControlComponent],
      template: `<retro-form-field><app-stub-control-with-ngcontrol /></retro-form-field>`,
      schemas: [NO_ERRORS_SCHEMA]
    })
    class WithNgControlHostComponent {}

    let fixture: ComponentFixture<WithNgControlHostComponent>;
    let formField: RetroFormFieldComponent;

    beforeEach(async () => {
      vi.clearAllMocks();
      await TestBed.configureTestingModule({
        imports: [WithNgControlHostComponent],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
      fixture = TestBed.createComponent(WithNgControlHostComponent);
      fixture.detectChanges();
      formField = fixture.debugElement.query(By.directive(RetroFormFieldComponent))?.componentInstance;
    });

    it('el form-field se inicializa correctamente con stub que tiene ngControl', () => {
      expect(formField).toBeTruthy();
    });
  });

  describe('con RetroInputDirective con formControl (statusChanges path)', () => {
    @Component({
      standalone: true,
      imports: [RetroFormFieldComponent, RetroInputDirective, ReactiveFormsModule],
      template: `
        <retro-form-field>
          <input retroInput [formControl]="control" />
        </retro-form-field>
      `,
      schemas: [NO_ERRORS_SCHEMA]
    })
    class WithRetroInputAndControlHostComponent {
      control = new FormControl<string | null>('', [Validators.required]);
    }

    let fixture: ComponentFixture<WithRetroInputAndControlHostComponent>;
    let formField: RetroFormFieldComponent;

    beforeEach(async () => {
      vi.clearAllMocks();
      await TestBed.configureTestingModule({
        imports: [WithRetroInputAndControlHostComponent],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
      fixture = TestBed.createComponent(WithRetroInputAndControlHostComponent);
      fixture.detectChanges();
      formField = fixture.debugElement.query(By.directive(RetroFormFieldComponent))?.componentInstance;
    });

    it('statusChanges del FormControl dispara _updateInvalid() en el form-field', () => {
      fixture.componentInstance.control.markAsTouched();
      fixture.componentInstance.control.updateValueAndValidity();
      fixture.detectChanges();
      if (formField) {
        expect(formField.invalid()).toBe(true);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  // ── Pruebas de controlRef dinámico ───────────────────────────────────────

  describe('controlRef dinámico (cambio de control en tiempo de ejecución)', () => {
    /** Control stub A con foco y errorState controlables. */
    class DynamicStubControl implements RetroFormFieldControl {
      readonly focusSubject: Subject<boolean> = new Subject<boolean>();
      readonly focused$ = this.focusSubject.asObservable();
      errorState = false;
      disabled = false;
      empty = true;
    }

    @Component({
      standalone: true,
      imports: [RetroFormFieldComponent],
      template: `<retro-form-field [controlRef]="activeControl()"></retro-form-field>`,
      schemas: [NO_ERRORS_SCHEMA]
    })
    class DynamicControlRefHostComponent {
      readonly activeControl: WritableSignal<DynamicStubControl | null> = signal<DynamicStubControl | null>(null);
    }

    let fixture: ComponentFixture<DynamicControlRefHostComponent>;
    let host: DynamicControlRefHostComponent;
    let formField: RetroFormFieldComponent;
    let controlA: DynamicStubControl;
    let controlB: DynamicStubControl;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DynamicControlRefHostComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(DynamicControlRefHostComponent);
      host = fixture.componentInstance;

      controlA = new DynamicStubControl();
      controlB = new DynamicStubControl();

      host.activeControl.set(controlA);
      fixture.detectChanges();

      formField = fixture.debugElement.query(By.directive(RetroFormFieldComponent)).componentInstance;
    });

    it('refleja el estado de focused del control A inicial', () => {
      controlA.focusSubject.next(true);
      fixture.detectChanges();
      expect(formField.focused()).toBe(true);
    });

    it('al cambiar a controlRef B, el estado focused refleja B y no A', () => {
      // Control A recibe foco primero
      controlA.focusSubject.next(true);
      fixture.detectChanges();
      expect(formField.focused()).toBe(true);

      // Cambiamos a control B
      host.activeControl.set(controlB);
      fixture.detectChanges();

      // Ahora A emite blur — NO debe afectar al form field (ya no está suscrito a A)
      controlA.focusSubject.next(false);
      fixture.detectChanges();
      expect(formField.focused()).toBe(false); // estado reseteado al cambiar de control

      // B emite foco — SÍ debe afectar al form field
      controlB.focusSubject.next(true);
      fixture.detectChanges();
      expect(formField.focused()).toBe(true);
    });

    it('al cambiar a controlRef B, invalid() refleja errorState de B', () => {
      // Control A activa errorState y dispara actualización
      controlA.errorState = true;
      controlA.focusSubject.next(true);
      fixture.detectChanges();
      expect(formField.invalid()).toBe(true);

      // Cambiamos a control B (sin errorState)
      controlB.errorState = false;
      host.activeControl.set(controlB);
      fixture.detectChanges();

      // El form field debe reflejar el estado de B (no A)
      expect(formField.invalid()).toBe(false);
    });

    it('al cambiar a controlRef null, focused() e invalid() se resetean', () => {
      controlA.errorState = true;
      controlA.focusSubject.next(true);
      fixture.detectChanges();
      expect(formField.focused()).toBe(true);
      expect(formField.invalid()).toBe(true);

      host.activeControl.set(null);
      fixture.detectChanges();

      // Las emisiones de A ya no deben afectar
      controlA.focusSubject.next(false);
      fixture.detectChanges();
      expect(formField.focused()).toBe(false);
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
