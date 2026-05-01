import { Component, NO_ERRORS_SCHEMA, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { HardwareListShellComponent } from './hardware-list-shell.component';
import { HardwareListItem } from '@/interfaces/hardware-list-item.interface';

function makeItem(overrides: Partial<HardwareListItem> = {}): HardwareListItem {
  return {
    id: 'item-1',
    modelId: 'model-1',
    brandId: 'brand-1',
    price: 300,
    purchaseDate: '2023-01-01',
    store: 'store-1',
    ...overrides
  };
}

/** Componente auxiliar que expone dos TemplateRef para los tests. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'test-wrapper',
  template: `
    <ng-template #headerTpl let-item>header:{{ item.id }}</ng-template>
    <ng-template #chipsTpl let-item>chips:{{ item.id }}</ng-template>
  `,
  standalone: true
})
class TestWrapperComponent {
  @ViewChild('headerTpl', { static: true }) headerTpl!: TemplateRef<unknown>;
  @ViewChild('chipsTpl', { static: true }) chipsTpl!: TemplateRef<unknown>;
}

function resolveModelName(id: string | null): string {
  if (!id) return '—';
  const names: Record<string, string> = { 'model-1': 'PlayStation 5' };
  return names[id] ?? '—';
}

function resolveBrandName(id: string | null): string {
  if (!id) return '—';
  const names: Record<string, string> = { 'brand-1': 'Sony' };
  return names[id] ?? '—';
}

function resolveStoreName(id: string | null): string {
  if (!id) return '';
  const names: Record<string, string> = { 'store-1': 'Media Markt' };
  return names[id] ?? id;
}

describe('HardwareListShellComponent', () => {
  let fixture: ComponentFixture<HardwareListShellComponent>;
  let component: HardwareListShellComponent;
  let wrapperFixture: ComponentFixture<TestWrapperComponent>;
  let wrapper: TestWrapperComponent;

  function setupComponent(inputs: {
    loading: boolean;
    items: HardwareListItem[];
    filteredItems: HardwareListItem[];
    totalSpent?: number;
    searchQuery?: string;
  }): void {
    fixture = TestBed.createComponent(HardwareListShellComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('loading', inputs.loading);
    fixture.componentRef.setInput('items', inputs.items);
    fixture.componentRef.setInput('filteredItems', inputs.filteredItems);
    fixture.componentRef.setInput('totalSpent', inputs.totalSpent ?? 0);
    fixture.componentRef.setInput('searchQuery', inputs.searchQuery ?? '');
    fixture.componentRef.setInput('statIcon', 'tv');
    fixture.componentRef.setInput('emptyIcon', 'tv_off');
    fixture.componentRef.setInput('i18nPrefix', 'consolesPage');
    fixture.componentRef.setInput('resolveModelName', resolveModelName);
    fixture.componentRef.setInput('resolveBrandName', resolveBrandName);
    fixture.componentRef.setInput('resolveStoreName', resolveStoreName);
    fixture.componentRef.setInput('cardHeaderTpl', wrapper.headerTpl);
    fixture.componentRef.setInput('cardChipsTpl', wrapper.chipsTpl);

    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HardwareListShellComponent,
        TestWrapperComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    wrapperFixture = TestBed.createComponent(TestWrapperComponent);
    wrapper = wrapperFixture.componentInstance;
    wrapperFixture.detectChanges();
  });

  describe('estado de carga (loading = true)', () => {
    beforeEach(() => {
      setupComponent({ loading: true, items: [], filteredItems: [] });
    });

    it('muestra el grid skeleton con 6 cards', () => {
      const grid = fixture.debugElement.query(By.css('.hw-list__grid'));
      expect(grid).not.toBeNull();
      const cards = fixture.debugElement.queryAll(By.css('.hw-list__card'));
      expect(cards).toHaveLength(6);
    });

    it('no muestra el empty state ni el bloque no-results', () => {
      expect(fixture.debugElement.query(By.css('.hw-list__empty'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.hw-list__no-results'))).toBeNull();
    });
  });

  describe('estado vacío (loading = false, items = [])', () => {
    beforeEach(() => {
      setupComponent({ loading: false, items: [], filteredItems: [] });
    });

    it('muestra el bloque de empty state', () => {
      const empty = fixture.debugElement.query(By.css('.hw-list__empty'));
      expect(empty).not.toBeNull();
    });

    it('no muestra el spinner', () => {
      const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
      expect(spinner).toBeNull();
    });

    it('no muestra el grid', () => {
      const grid = fixture.debugElement.query(By.css('.hw-list__grid'));
      expect(grid).toBeNull();
    });

    it('no muestra el bloque no-results', () => {
      const noResults = fixture.debugElement.query(By.css('.hw-list__no-results'));
      expect(noResults).toBeNull();
    });
  });

  describe('sin resultados de búsqueda (items > 0, filteredItems = [])', () => {
    beforeEach(() => {
      setupComponent({
        loading: false,
        items: [makeItem()],
        filteredItems: [],
        searchQuery: 'xbox'
      });
    });

    it('muestra el bloque no-results', () => {
      const noResults = fixture.debugElement.query(By.css('.hw-list__no-results'));
      expect(noResults).not.toBeNull();
    });

    it('no muestra el grid ni el empty state', () => {
      expect(fixture.debugElement.query(By.css('.hw-list__grid'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.hw-list__empty'))).toBeNull();
    });
  });

  describe('lista con items (filteredItems.length > 0)', () => {
    const items = [
      makeItem({ id: 'item-1', modelId: 'model-1', brandId: 'brand-1' }),
      makeItem({ id: 'item-2', modelId: 'model-1', brandId: 'brand-1' })
    ];

    beforeEach(() => {
      setupComponent({ loading: false, items, filteredItems: items });
    });

    it('muestra el grid', () => {
      const grid = fixture.debugElement.query(By.css('.hw-list__grid'));
      expect(grid).not.toBeNull();
    });

    it('renderiza una card por cada item filtrado', () => {
      const cards = fixture.debugElement.queryAll(By.css('.hw-list__card'));
      expect(cards).toHaveLength(2);
    });

    it('no muestra el spinner', () => {
      const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
      expect(spinner).toBeNull();
    });

    it('no muestra empty state ni no-results', () => {
      expect(fixture.debugElement.query(By.css('.hw-list__empty'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.hw-list__no-results'))).toBeNull();
    });
  });

  describe('stats', () => {
    it('muestra skeletons cuando loading es true', () => {
      setupComponent({ loading: true, items: [], filteredItems: [] });
      const skeletons = fixture.debugElement.queryAll(By.css('app-skeleton'));
      expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });

    it('muestra el count de items filtrados cuando loading es false', () => {
      const items = [makeItem({ id: 'item-1' }), makeItem({ id: 'item-2' })];
      setupComponent({ loading: false, items, filteredItems: items });

      const statSpans = fixture.debugElement.queryAll(By.css('.hw-list__stat span'));
      const countSpan = statSpans[0];
      expect(countSpan.nativeElement.textContent.trim()).toBe('2');
    });

    it('muestra el totalSpent cuando loading es false', () => {
      setupComponent({
        loading: false,
        items: [makeItem()],
        filteredItems: [makeItem()],
        totalSpent: 300
      });

      const statSpans = fixture.debugElement.queryAll(By.css('.hw-list__stat span'));
      const spentSpan = statSpans[1];
      expect(spentSpan.nativeElement.textContent).toContain('300');
    });
  });

  describe('búsqueda (searchChange)', () => {
    it('emite searchChange al cambiar el valor del campo de búsqueda en list-page-header', () => {
      setupComponent({ loading: false, items: [makeItem()], filteredItems: [makeItem()] });

      const spy = vi.fn();
      component.searchChange.subscribe(spy);

      const header = fixture.debugElement.query(By.css('app-list-page-header'));
      header.triggerEventHandler('searchChange', 'play');

      expect(spy).toHaveBeenCalledWith('play');
    });
  });

  describe('onAdd (addClick)', () => {
    it('emite addClick al hacer click en el FAB', () => {
      setupComponent({ loading: false, items: [makeItem()], filteredItems: [makeItem()] });

      const spy = vi.fn();
      component.addClick.subscribe(spy);

      const fab = fixture.debugElement.query(By.css('.hw-list__fab'));
      fab.nativeElement.click();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emite addClick al hacer click en el botón del header (list-page-header addClick)', () => {
      setupComponent({ loading: false, items: [makeItem()], filteredItems: [makeItem()] });

      const spy = vi.fn();
      component.addClick.subscribe(spy);

      const header = fixture.debugElement.query(By.css('app-list-page-header'));
      header.triggerEventHandler('addClick', undefined);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDetail (detailClick)', () => {
    it('emite detailClick con el item correcto al hacer click en una card', () => {
      const item = makeItem({ id: 'item-click' });
      setupComponent({ loading: false, items: [item], filteredItems: [item] });

      const spy = vi.fn();
      component.detailClick.subscribe(spy);

      const card = fixture.debugElement.query(By.css('.hw-list__card'));
      card.nativeElement.click();

      expect(spy).toHaveBeenCalledWith(item);
    });
  });

  describe('templates proyectados (cardHeaderTpl y cardChipsTpl)', () => {
    it('renderiza el contenido de cardHeaderTpl dentro de cada card', () => {
      const item = makeItem({ id: 'item-tpl' });
      setupComponent({ loading: false, items: [item], filteredItems: [item] });

      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.textContent).toContain('header:item-tpl');
    });

    it('renderiza el contenido de cardChipsTpl dentro de cada card', () => {
      const item = makeItem({ id: 'item-tpl' });
      setupComponent({ loading: false, items: [item], filteredItems: [item] });

      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.textContent).toContain('chips:item-tpl');
    });
  });

  describe('resolvers', () => {
    it('llama a resolveModelName con el modelId del item y muestra el resultado', () => {
      const spyModel = vi.fn().mockReturnValue('PlayStation 5');
      const item = makeItem({ id: 'item-r', modelId: 'model-1', brandId: 'brand-1' });
      setupComponent({ loading: false, items: [item], filteredItems: [item] });
      fixture.componentRef.setInput('resolveModelName', spyModel);
      fixture.detectChanges();

      expect(spyModel).toHaveBeenCalledWith('model-1');
    });

    it('llama a resolveBrandName con el brandId del item y muestra el resultado', () => {
      const spyBrand = vi.fn().mockReturnValue('Sony');
      const item = makeItem({ id: 'item-r', modelId: 'model-1', brandId: 'brand-1' });
      setupComponent({ loading: false, items: [item], filteredItems: [item] });
      fixture.componentRef.setInput('resolveBrandName', spyBrand);
      fixture.detectChanges();

      expect(spyBrand).toHaveBeenCalledWith('brand-1');
    });

    it('llama a resolveStoreName con el store del item y muestra el resultado', () => {
      const spyStore = vi.fn().mockReturnValue('Media Markt');
      const item = makeItem({ id: 'item-r', store: 'store-1' });
      setupComponent({ loading: false, items: [item], filteredItems: [item] });
      fixture.componentRef.setInput('resolveStoreName', spyStore);
      fixture.detectChanges();

      expect(spyStore).toHaveBeenCalledWith('store-1');
    });
  });
});
