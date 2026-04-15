import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CatalogItemCardComponent } from './catalog-item-card.component';

describe('CatalogItemCardComponent', () => {
  let component: CatalogItemCardComponent;
  let fixture: ComponentFixture<CatalogItemCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatalogItemCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(CatalogItemCardComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(CatalogItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('valores por defecto de los inputs', () => {
    it('icon es cadena vacía por defecto', () => {
      expect(component.icon()).toBe('');
    });

    it('name es cadena vacía por defecto', () => {
      expect(component.name()).toBe('');
    });

    it('chips es array vacío por defecto', () => {
      expect(component.chips()).toEqual([]);
    });

    it('selected es false por defecto', () => {
      expect(component.selected()).toBe(false);
    });

    it('showChevron es false por defecto', () => {
      expect(component.showChevron()).toBe(false);
    });
  });

  describe('inputs con valores', () => {
    it('recibe icon correctamente', () => {
      fixture.componentRef.setInput('icon', 'tv');
      expect(component.icon()).toBe('tv');
    });

    it('recibe name correctamente', () => {
      fixture.componentRef.setInput('name', 'PlayStation 5');
      expect(component.name()).toBe('PlayStation 5');
    });

    it('recibe chips correctamente', () => {
      fixture.componentRef.setInput('chips', ['Generación 9', 'Sony']);
      expect(component.chips()).toEqual(['Generación 9', 'Sony']);
    });

    it('recibe selected correctamente', () => {
      fixture.componentRef.setInput('selected', true);
      expect(component.selected()).toBe(true);
    });

    it('recibe showChevron correctamente', () => {
      fixture.componentRef.setInput('showChevron', true);
      expect(component.showChevron()).toBe(true);
    });
  });

  describe('output cardClick', () => {
    it('emite cardClick al hacer clic', () => {
      const spy = vi.spyOn(component.cardClick, 'emit');
      component.cardClick.emit();
      expect(spy).toHaveBeenCalled();
    });

    it('emite cardClick al hacer clic en el elemento host', () => {
      const spy = vi.spyOn(component.cardClick, 'emit');
      fixture.nativeElement.click();
      expect(spy).toHaveBeenCalled();
    });
  });
});
