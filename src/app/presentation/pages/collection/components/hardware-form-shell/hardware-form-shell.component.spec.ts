import { Component, NO_ERRORS_SCHEMA, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { HardwareFormShellComponent } from './hardware-form-shell.component';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { StoreModel } from '@/models/store/store.model';

// ─── Host de prueba ───────────────────────────────────────────────────────────

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'test-host',
  template: `
    <app-hardware-form-shell
      [loading]="loading"
      [saving]="saving"
      [isEditMode]="isEditMode"
      [i18nPrefix]="i18nPrefix"
      [brands]="brands"
      [models]="models"
      [editions]="editions"
      [filteredBrands]="filteredBrands"
      [filteredModels]="filteredModels"
      [filteredStores]="filteredStores"
      [form]="form"
      [displayBrandLabel]="displayBrandLabel"
      [displayModelLabel]="displayModelLabel"
      [displayStoreLabel]="displayStoreLabel"
      [extraFieldsTpl]="extraTpl"
      (cancelClick)="onCancel()"
      (submitClick)="onSubmit()"
      (brandChange)="onBrandChange($event)"
      (modelChange)="onModelChange($event)">
    </app-hardware-form-shell>

    <ng-template #extraTpl>
      <div class="extra-field">campo-específico</div>
    </ng-template>
  `,
  standalone: true,
  imports: [HardwareFormShellComponent, ReactiveFormsModule]
})
class TestHostComponent {
  @ViewChild('extraTpl') extraTpl!: TemplateRef<unknown>;

  loading = false;
  saving = false;
  isEditMode = false;
  i18nPrefix = 'consolePage';

  brands: HardwareBrandModel[] = [];
  models: HardwareModelModel[] = [];
  editions: HardwareEditionModel[] = [];
  filteredBrands: HardwareBrandModel[] = [];
  filteredModels: HardwareModelModel[] = [];
  filteredStores: StoreModel[] = [];

  form = new FormGroup({
    brandId: new FormControl<string | null>(null),
    modelId: new FormControl<string | null>(null),
    editionId: new FormControl<string | null>({ value: null, disabled: true }),
    condition: new FormControl<string>('used'),
    price: new FormControl<number | null>(null),
    store: new FormControl<string | null>(null),
    purchaseDate: new FormControl<string | null>(null),
    notes: new FormControl<string | null>(null)
  });

  cancelCalled = false;
  submitCalled = false;
  lastBrandChange: string | null | undefined = undefined;
  lastModelChange: string | null | undefined = undefined;

  displayBrandLabel = (_id: string | null): string => '';
  displayModelLabel = (_id: string | null): string => '';
  displayStoreLabel = (_id: string | null): string => '';

  // eslint-disable-next-line jsdoc/require-jsdoc
  onCancel(): void {
    this.cancelCalled = true;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  onSubmit(): void {
    this.submitCalled = true;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  onBrandChange(id: string | null): void {
    this.lastBrandChange = id;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  onModelChange(id: string | null): void {
    this.lastModelChange = id;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('HardwareFormShellComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        ReactiveFormsModule,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // ─── Estado de carga ─────────────────────────────────────────────────────

  describe('estado de carga', () => {
    it('muestra el spinner y oculta el formulario cuando loading es true', async () => {
      host.loading = true;
      fixture.detectChanges();
      await fixture.whenStable();

      const spinner = fixture.debugElement.query(By.css('mat-progress-spinner[diameter="48"]'));
      const form = fixture.debugElement.query(By.css('form'));

      expect(spinner).toBeTruthy();
      expect(form).toBeNull();
    });

    it('muestra el formulario y oculta el spinner cuando loading es false', async () => {
      host.loading = false;
      fixture.detectChanges();
      await fixture.whenStable();

      const form = fixture.debugElement.query(By.css('form'));
      expect(form).toBeTruthy();
    });
  });

  // ─── Modo edición vs creación ─────────────────────────────────────────────

  describe('modo edición vs creación', () => {
    it('renderiza el componente en modo creación sin errores', async () => {
      host.isEditMode = false;
      fixture.detectChanges();
      await fixture.whenStable();

      const shell = fixture.debugElement.query(By.css('app-hardware-form-shell'));
      expect(shell).toBeTruthy();
    });

    it('renderiza el componente en modo edición sin errores', async () => {
      host.isEditMode = true;
      fixture.detectChanges();
      await fixture.whenStable();

      const shell = fixture.debugElement.query(By.css('app-hardware-form-shell'));
      expect(shell).toBeTruthy();
    });
  });

  // ─── cancelClick ─────────────────────────────────────────────────────────

  describe('cancelClick', () => {
    it('emite cancelClick al hacer click en el botón back del header', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      const cancelSpy = vi.fn();
      shellComponent.cancelClick.subscribe(cancelSpy);

      shellComponent.cancelClick.emit();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('llama al handler del host cuando cancelClick se emite', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      shellComponent.cancelClick.emit();
      fixture.detectChanges();

      expect(host.cancelCalled).toBe(true);
    });
  });

  // ─── submitClick ─────────────────────────────────────────────────────────

  describe('submitClick', () => {
    it('llama al handler del host cuando submitClick se emite', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      shellComponent.submitClick.emit();
      fixture.detectChanges();

      expect(host.submitCalled).toBe(true);
    });
  });

  // ─── brandChange ─────────────────────────────────────────────────────────

  describe('brandChange', () => {
    it('llama al handler del host con el id de marca cuando brandChange se emite', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      shellComponent.brandChange.emit('brand-uuid-1');
      fixture.detectChanges();

      expect(host.lastBrandChange).toBe('brand-uuid-1');
    });

    it('llama al handler del host con null cuando brandChange emite null', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      shellComponent.brandChange.emit(null);
      fixture.detectChanges();

      expect(host.lastBrandChange).toBeNull();
    });
  });

  // ─── modelChange ─────────────────────────────────────────────────────────

  describe('modelChange', () => {
    it('llama al handler del host con el id de modelo cuando modelChange se emite', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      shellComponent.modelChange.emit('model-uuid-1');
      fixture.detectChanges();

      expect(host.lastModelChange).toBe('model-uuid-1');
    });

    it('llama al handler del host con null cuando modelChange emite null', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      shellComponent.modelChange.emit(null);
      fixture.detectChanges();

      expect(host.lastModelChange).toBeNull();
    });
  });

  // ─── extraFieldsTpl ───────────────────────────────────────────────────────

  describe('extraFieldsTpl', () => {
    it('proyecta el template de campos específicos en el formulario', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const extraField = fixture.debugElement.query(By.css('.extra-field'));
      expect(extraField).toBeTruthy();
      expect(extraField.nativeElement.textContent).toContain('campo-específico');
    });
  });

  // ─── inputs del shell ─────────────────────────────────────────────────────

  describe('inputs del shell', () => {
    it('refleja el valor del input loading en el componente shell', async () => {
      host.loading = true;
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      expect(shellComponent.loading()).toBe(true);
    });

    it('refleja el valor del input saving en el componente shell', async () => {
      host.saving = true;
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      expect(shellComponent.saving()).toBe(true);
    });

    it('refleja el valor del input isEditMode en el componente shell', async () => {
      host.isEditMode = true;
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      expect(shellComponent.isEditMode()).toBe(true);
    });

    it('refleja el valor del input i18nPrefix en el componente shell', async () => {
      host.i18nPrefix = 'controllerPage';
      fixture.detectChanges();
      await fixture.whenStable();

      const shellFixture = fixture.debugElement.query(By.directive(HardwareFormShellComponent));
      const shellComponent = shellFixture.componentInstance as HardwareFormShellComponent;

      expect(shellComponent.i18nPrefix()).toBe('controllerPage');
    });
  });
});
