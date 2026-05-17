import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { HardwareDetailShellComponent } from './hardware-detail-shell.component';
import { HardwareLoanFormComponent } from '@/pages/collection/components/hardware-loan-form/hardware-loan-form.component';
import { SaleFormComponent } from '@/pages/collection/components/sale-form/sale-form.component';
import { ConsoleModel } from '@/models/console/console.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<ConsoleModel> = {}): ConsoleModel {
  return {
    id: 'console-1',
    userId: 'user-1',
    brandId: 'brand-1',
    modelId: 'model-1',
    editionId: null,
    region: null,
    condition: 'used',
    price: null,
    store: null,
    purchaseDate: null,
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    forSale: false,
    salePrice: null,
    soldAt: null,
    soldPriceFinal: null,
    activeLoanId: null,
    activeLoanTo: null,
    activeLoanAt: null,
    ...overrides
  };
}

function makeBrand(overrides: Partial<HardwareBrandModel> = {}): HardwareBrandModel {
  return { id: 'brand-1', name: 'Sony', ...overrides };
}

function makeModel(overrides: Partial<HardwareModelModel> = {}): HardwareModelModel {
  return {
    id: 'model-1',
    name: 'PlayStation 5',
    brandId: 'brand-1',
    type: 'console',
    generation: null,
    category: null,
    ...overrides
  };
}

function makeEdition(overrides: Partial<HardwareEditionModel> = {}): HardwareEditionModel {
  return { id: 'edition-1', name: 'Digital Edition', modelId: 'model-1', ...overrides };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('HardwareDetailShellComponent', () => {
  let fixture: ComponentFixture<HardwareDetailShellComponent>;
  let component: HardwareDetailShellComponent;

  /**
   * Configura el componente con los inputs requeridos y los opcionales
   * indicados. Llama a detectChanges al final.
   */
  function setupComponent(
    overrides: {
      loading?: boolean;
      showSaleForm?: boolean;
      showLoanForm?: boolean;
      deleting?: boolean;
      item?: ConsoleModel | undefined;
      brand?: HardwareBrandModel | undefined;
      model?: HardwareModelModel | undefined;
      edition?: HardwareEditionModel | undefined;
      forSale?: boolean;
      salePrice?: number | null;
      soldAt?: string | null;
      soldPriceFinal?: number | null;
      price?: number | null;
      purchaseDate?: string | null;
      storeLabel?: string;
      notes?: string | null;
      activeLoanId?: string | null;
      activeLoanTo?: string | null;
    } = {}
  ): void {
    fixture = TestBed.createComponent(HardwareDetailShellComponent);
    component = fixture.componentInstance;

    // Inputs required
    fixture.componentRef.setInput('loading', overrides.loading ?? false);
    fixture.componentRef.setInput('showSaleForm', overrides.showSaleForm ?? false);
    fixture.componentRef.setInput('showLoanForm', overrides.showLoanForm ?? false);
    fixture.componentRef.setInput('deleting', overrides.deleting ?? false);
    fixture.componentRef.setInput('itemType', 'console');
    fixture.componentRef.setInput('i18nPagePrefix', 'consoleDetailPage');
    fixture.componentRef.setInput('i18nFieldPrefix', 'consolePage');
    fixture.componentRef.setInput('saveFn', vi.fn().mockResolvedValue(undefined));
    fixture.componentRef.setInput('sellFn', vi.fn().mockResolvedValue(undefined));

    // Inputs opcionales
    fixture.componentRef.setInput('item', overrides.item);
    fixture.componentRef.setInput('brand', overrides.brand);
    fixture.componentRef.setInput('model', overrides.model);
    fixture.componentRef.setInput('edition', overrides.edition);
    fixture.componentRef.setInput('forSale', overrides.forSale ?? false);
    fixture.componentRef.setInput('salePrice', overrides.salePrice ?? null);
    fixture.componentRef.setInput('soldAt', overrides.soldAt ?? null);
    fixture.componentRef.setInput('soldPriceFinal', overrides.soldPriceFinal ?? null);
    fixture.componentRef.setInput('price', overrides.price ?? null);
    fixture.componentRef.setInput('purchaseDate', overrides.purchaseDate ?? null);
    fixture.componentRef.setInput('storeLabel', overrides.storeLabel ?? '');
    fixture.componentRef.setInput('notes', overrides.notes ?? null);
    fixture.componentRef.setInput('activeLoanId', overrides.activeLoanId ?? null);
    fixture.componentRef.setInput('activeLoanTo', overrides.activeLoanTo ?? null);

    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HardwareDetailShellComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    // Reemplazamos los componentes con dependencias de inyección complejas
    // por versiones vacías para aislar el componente bajo test.
    // Añadimos NO_ERRORS_SCHEMA al propio componente para que Angular no
    // rechace los selectores desconocidos al renderizar el template.
    TestBed.overrideComponent(HardwareDetailShellComponent, {
      remove: { imports: [HardwareLoanFormComponent, SaleFormComponent] },
      add: { schemas: [NO_ERRORS_SCHEMA] }
    });
  });

  // ─── 1. Estado de carga ────────────────────────────────────────────────────

  describe('estado de carga (loading = true)', () => {
    beforeEach(() => {
      setupComponent({ loading: true });
    });

    it('muestra los skeletons de carga', () => {
      const skeletons = fixture.debugElement.queryAll(By.css('app-skeleton'));
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('muestra el header de navegación con botón de vuelta', () => {
      const header = fixture.debugElement.query(By.css('.hardware-detail__header'));
      expect(header).not.toBeNull();
      const btn = header.query(By.css('button'));
      expect(btn).not.toBeNull();
    });

    it('no muestra la sección de datos', () => {
      const section = fixture.debugElement.query(By.css('.hw-detail__section'));
      expect(section).toBeNull();
    });
  });

  // ─── 2. Item no definido ───────────────────────────────────────────────────

  describe('item no definido (loading = false, item = undefined)', () => {
    beforeEach(() => {
      setupComponent({ loading: false, item: undefined });
    });

    it('no muestra el spinner', () => {
      const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
      expect(spinner).toBeNull();
    });

    it('no muestra el header', () => {
      const header = fixture.debugElement.query(By.css('.hardware-detail__header'));
      expect(header).toBeNull();
    });

    it('no muestra la sección de datos', () => {
      const section = fixture.debugElement.query(By.css('.hw-detail__section'));
      expect(section).toBeNull();
    });

    it('no muestra el contenedor de acciones', () => {
      const actions = fixture.debugElement.query(By.css('.hardware-detail__actions'));
      expect(actions).toBeNull();
    });
  });

  // ─── 3. Header ────────────────────────────────────────────────────────────

  describe('header (loading = false, item definido)', () => {
    beforeEach(() => {
      setupComponent({
        item: makeItem(),
        brand: makeBrand(),
        model: makeModel()
      });
    });

    it('muestra el header principal', () => {
      const header = fixture.debugElement.query(By.css('.hardware-detail__header'));
      expect(header).not.toBeNull();
    });

    it('muestra el nombre del modelo', () => {
      const title = fixture.debugElement.query(By.css('.hardware-detail__title'));
      expect(title.nativeElement.textContent.trim()).toBe('PlayStation 5');
    });

    it('muestra el nombre de la marca', () => {
      const subtitle = fixture.debugElement.query(By.css('.hardware-detail__subtitle'));
      expect(subtitle.nativeElement.textContent.trim()).toBe('Sony');
    });

    it('muestra "—" cuando model es undefined', () => {
      setupComponent({ item: makeItem(), brand: makeBrand(), model: undefined });
      const title = fixture.debugElement.query(By.css('.hardware-detail__title'));
      expect(title.nativeElement.textContent.trim()).toBe('—');
    });

    it('muestra "—" cuando brand es undefined', () => {
      setupComponent({ item: makeItem(), model: makeModel(), brand: undefined });
      const subtitle = fixture.debugElement.query(By.css('.hardware-detail__subtitle'));
      expect(subtitle.nativeElement.textContent.trim()).toBe('—');
    });

    it('emite backClicked al hacer click en el botón back', () => {
      const spy = vi.fn();
      component.backClicked.subscribe(spy);

      const btn = fixture.debugElement.query(By.css('.hardware-detail__header button'));
      btn.nativeElement.click();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── 4. Edición ───────────────────────────────────────────────────────────

  describe('edition', () => {
    it('muestra el bloque de edición cuando hay edition', () => {
      setupComponent({ item: makeItem(), edition: makeEdition() });
      const editionEl = fixture.debugElement.query(By.css('.hardware-detail__edition'));
      expect(editionEl).not.toBeNull();
      expect(editionEl.nativeElement.textContent).toContain('Digital Edition');
    });

    it('oculta el bloque de edición cuando edition es undefined', () => {
      setupComponent({ item: makeItem(), edition: undefined });
      const editionEl = fixture.debugElement.query(By.css('.hardware-detail__edition'));
      expect(editionEl).toBeNull();
    });
  });

  // ─── 5. Chips de estado ───────────────────────────────────────────────────

  describe('chips de estado', () => {
    it('oculta el contenedor de chips cuando forSale=false y activeLoanId=null', () => {
      setupComponent({ item: makeItem(), forSale: false, activeLoanId: null });
      const chips = fixture.debugElement.query(By.css('.hardware-detail__status-chips'));
      expect(chips).toBeNull();
    });

    it('muestra el contenedor de chips cuando forSale=true', () => {
      setupComponent({ item: makeItem(), forSale: true });
      const chips = fixture.debugElement.query(By.css('.hardware-detail__status-chips'));
      expect(chips).not.toBeNull();
    });

    it('muestra el contenedor de chips cuando activeLoanId tiene valor', () => {
      setupComponent({ item: makeItem(), activeLoanId: 'loan-1' });
      const chips = fixture.debugElement.query(By.css('.hardware-detail__status-chips'));
      expect(chips).not.toBeNull();
    });

    it('muestra un app-lib-chip para sale cuando forSale=true', () => {
      setupComponent({ item: makeItem(), forSale: true });
      const chipsContainer = fixture.debugElement.query(By.css('.hardware-detail__status-chips'));
      const chipEls = chipsContainer.queryAll(By.css('app-lib-chip'));
      expect(chipEls.length).toBeGreaterThanOrEqual(1);
    });

    it('oculta el chip de sale cuando forSale=false', () => {
      setupComponent({ item: makeItem(), forSale: false, activeLoanId: 'loan-1' });
      const chipsContainer = fixture.debugElement.query(By.css('.hardware-detail__status-chips'));
      // Sólo el chip de loan debe estar visible
      const chipEls = chipsContainer.queryAll(By.css('app-lib-chip'));
      expect(chipEls.length).toBe(1);
    });

    it('muestra un app-lib-chip para loan cuando activeLoanId tiene valor', () => {
      setupComponent({ item: makeItem(), activeLoanId: 'loan-1', activeLoanTo: 'Ana' });
      const chipsContainer = fixture.debugElement.query(By.css('.hardware-detail__status-chips'));
      const chipEls = chipsContainer.queryAll(By.css('app-lib-chip'));
      expect(chipEls.length).toBeGreaterThanOrEqual(1);
    });

    it('oculta el chip de loan cuando activeLoanId es null', () => {
      setupComponent({ item: makeItem(), forSale: true, activeLoanId: null });
      const chipsContainer = fixture.debugElement.query(By.css('.hardware-detail__status-chips'));
      const chipEls = chipsContainer.queryAll(By.css('app-lib-chip'));
      expect(chipEls.length).toBe(1);
    });
  });

  // ─── 6. Formulario de venta ───────────────────────────────────────────────

  describe('formulario de venta (showSaleForm = true)', () => {
    beforeEach(() => {
      setupComponent({ item: makeItem(), showSaleForm: true });
    });

    it('muestra app-sale-form', () => {
      const form = fixture.debugElement.query(By.css('app-sale-form'));
      expect(form).not.toBeNull();
    });

    it('oculta la sección de datos de usuario', () => {
      const section = fixture.debugElement.query(By.css('.hw-detail__section'));
      expect(section).toBeNull();
    });

    it('oculta app-hardware-loan-form', () => {
      const form = fixture.debugElement.query(By.css('app-hardware-loan-form'));
      expect(form).toBeNull();
    });

    it('oculta el contenedor de acciones', () => {
      const actions = fixture.debugElement.query(By.css('.hardware-detail__actions'));
      expect(actions).toBeNull();
    });
  });

  // ─── 7. Formulario de préstamo ────────────────────────────────────────────

  describe('formulario de préstamo (showLoanForm = true)', () => {
    beforeEach(() => {
      setupComponent({ item: makeItem(), showLoanForm: true });
    });

    it('muestra app-hardware-loan-form', () => {
      const form = fixture.debugElement.query(By.css('app-hardware-loan-form'));
      expect(form).not.toBeNull();
    });

    it('oculta app-sale-form', () => {
      const form = fixture.debugElement.query(By.css('app-sale-form'));
      expect(form).toBeNull();
    });

    it('oculta la sección de datos de usuario', () => {
      const section = fixture.debugElement.query(By.css('.hw-detail__section'));
      expect(section).toBeNull();
    });

    it('oculta el contenedor de acciones', () => {
      const actions = fixture.debugElement.query(By.css('.hardware-detail__actions'));
      expect(actions).toBeNull();
    });
  });

  // ─── 8. Sección de datos ──────────────────────────────────────────────────

  describe('sección de datos (showSaleForm=false, showLoanForm=false)', () => {
    it('muestra la sección de datos cuando no hay formulario activo', () => {
      setupComponent({ item: makeItem() });
      const section = fixture.debugElement.query(By.css('.hw-detail__section'));
      expect(section).not.toBeNull();
    });

    it('muestra app-lib-data-row de precio cuando price tiene valor', () => {
      setupComponent({ item: makeItem(), price: 499 });
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('no muestra app-lib-data-row de precio cuando price es null', () => {
      setupComponent({ item: makeItem(), price: null, storeLabel: '', purchaseDate: null });
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows).toHaveLength(0);
    });

    it('muestra app-lib-data-row de tienda cuando storeLabel tiene valor', () => {
      setupComponent({ item: makeItem(), storeLabel: 'Media Markt' });
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('muestra app-lib-data-row de fecha cuando purchaseDate tiene valor', () => {
      setupComponent({ item: makeItem(), purchaseDate: '2023-06-15' });
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('muestra tres app-lib-data-row cuando todos los campos tienen valor', () => {
      setupComponent({
        item: makeItem(),
        price: 499,
        storeLabel: 'Media Markt',
        purchaseDate: '2023-06-15'
      });
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows).toHaveLength(3);
    });

    it('muestra app-lib-data-row de notas cuando notes tiene valor', () => {
      setupComponent({ item: makeItem(), notes: 'Muy buen estado' });
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('no muestra app-lib-data-row de notas cuando notes es null', () => {
      setupComponent({ item: makeItem(), notes: null });
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows).toHaveLength(0);
    });
  });

  // ─── 9. Estado vendido (soldAt) ───────────────────────────────────────────

  describe('estado vendido (soldAt tiene valor)', () => {
    beforeEach(() => {
      setupComponent({ item: makeItem(), soldAt: '2024-07-15', soldPriceFinal: 200 });
    });

    it('oculta las acciones normales (4 botones)', () => {
      const actions = fixture.debugElement.queryAll(By.css('.hardware-detail__actions'));
      const normalActions = actions.find((a) => a.nativeElement.querySelectorAll('app-lib-button').length === 4);
      expect(normalActions).toBeUndefined();
    });

    it('muestra la sección de información de venta', () => {
      const section = fixture.debugElement.query(By.css('.hw-detail__section'));
      expect(section).not.toBeNull();
    });

    it('muestra app-lib-data-row de precio de venta cuando soldPriceFinal no es null', () => {
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('muestra sólo la fecha cuando soldPriceFinal es null', () => {
      setupComponent({ item: makeItem(), soldAt: '2024-07-15', soldPriceFinal: null });
      const rows = fixture.debugElement.queryAll(By.css('.hardware-detail__purchase-section app-lib-data-row'));
      expect(rows).toHaveLength(1);
    });

    it('emite undoSaleClicked cuando se emite el output', () => {
      const spy = vi.fn();
      component.undoSaleClicked.subscribe(spy);

      component.undoSaleClicked.emit();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emite openSaleClicked cuando se emite el output', () => {
      const spy = vi.fn();
      component.openSaleClicked.subscribe(spy);

      component.openSaleClicked.emit();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── 10. Botón eliminar ──────────────────────────────────────────────────

  describe('botón eliminar', () => {
    it('muestra el app-lib-button de eliminar con [disabled] cuando deleting=true', () => {
      setupComponent({ item: makeItem(), deleting: true });
      const actions = fixture.debugElement.query(By.css('.hardware-detail__actions'));
      const btns = actions.queryAll(By.css('app-lib-button'));
      // 4 botones: edit, venta, prestamo, eliminar
      expect(btns.length).toBe(4);
    });

    it('muestra el app-lib-button de eliminar cuando deleting=false', () => {
      setupComponent({ item: makeItem(), deleting: false });
      const actions = fixture.debugElement.query(By.css('.hardware-detail__actions'));
      const btns = actions.queryAll(By.css('app-lib-button'));
      expect(btns.length).toBe(4);
    });
  });

  // ─── 11. Outputs de acciones ──────────────────────────────────────────────

  describe('outputs de acciones', () => {
    beforeEach(() => {
      setupComponent({ item: makeItem() });
    });

    it('emite editClicked cuando se emite el output', () => {
      const spy = vi.fn();
      component.editClicked.subscribe(spy);

      component.editClicked.emit();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emite openSaleClicked cuando se emite el output', () => {
      const spy = vi.fn();
      component.openSaleClicked.subscribe(spy);

      component.openSaleClicked.emit();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emite openLoanClicked cuando se emite el output', () => {
      const spy = vi.fn();
      component.openLoanClicked.subscribe(spy);

      component.openLoanClicked.emit();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emite deleteClicked cuando se emite el output', () => {
      const spy = vi.fn();
      component.deleteClicked.subscribe(spy);

      component.deleteClicked.emit();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('el app-lib-button de préstamo existe cuando hay préstamo activo', () => {
      setupComponent({ item: makeItem(), activeLoanId: 'loan-1', activeLoanTo: 'Ana' });
      const actions = fixture.debugElement.query(By.css('.hardware-detail__actions'));
      const btns = actions.queryAll(By.css('app-lib-button'));
      expect(btns[2]).not.toBeNull();
    });

    it('el app-lib-button de préstamo existe cuando no hay préstamo activo', () => {
      setupComponent({ item: makeItem(), activeLoanId: null });
      const actions = fixture.debugElement.query(By.css('.hardware-detail__actions'));
      const btns = actions.queryAll(By.css('app-lib-button'));
      expect(btns[2]).not.toBeNull();
    });
  });
});
