import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it } from 'vitest';

import { ListPageHeaderComponent } from './list-page-header.component';

/**
 * Tests del componente presentacional ListPageHeaderComponent.
 * Verifica que el componente se crea correctamente y que los inputs
 * tienen los valores por defecto esperados.
 */
describe('ListPageHeaderComponent', () => {
  let component: ListPageHeaderComponent;
  let fixture: ComponentFixture<ListPageHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ListPageHeaderComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ListPageHeaderComponent);
    component = fixture.componentInstance;
  });

  describe('creación', () => {
    it('crea el componente correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('valores por defecto de los inputs', () => {
    it('searchPlaceholder es "" por defecto', () => {
      expect(component.searchPlaceholder()).toBe('');
    });

    it('searchValue es "" por defecto', () => {
      expect(component.searchValue()).toBe('');
    });

    it('showFilterBtn es false por defecto', () => {
      expect(component.showFilterBtn()).toBe(false);
    });

    it('filterCount es 0 por defecto', () => {
      expect(component.filterCount()).toBe(0);
    });

    it('showAddBtn es true por defecto', () => {
      expect(component.showAddBtn()).toBe(true);
    });

    it('showViewModeBtn es false por defecto', () => {
      expect(component.showViewModeBtn()).toBe(false);
    });

    it('viewMode es "grid" por defecto', () => {
      expect(component.viewMode()).toBe('grid');
    });

    it('disabled es false por defecto', () => {
      expect(component.disabled()).toBe(false);
    });

    it('commandPath es "" por defecto', () => {
      expect(component.commandPath()).toBe('');
    });

    it('commandFlags es [] por defecto', () => {
      expect(component.commandFlags()).toEqual([]);
    });
  });

  describe('command bar', () => {
    it('no renderiza retro-command-bar cuando commandPath está vacío', () => {
      fixture.detectChanges();
      const bar = fixture.debugElement.query(By.css('retro-command-bar'));
      expect(bar).toBeNull();
    });

    it('renderiza retro-command-bar cuando commandPath tiene valor', () => {
      fixture.componentRef.setInput('commandPath', 'monchito ~/library/games');
      fixture.detectChanges();
      const bar = fixture.debugElement.query(By.css('retro-command-bar'));
      expect(bar).not.toBeNull();
    });

    it('pasa el path correcto a retro-command-bar', () => {
      fixture.componentRef.setInput('commandPath', 'monchito ~/library/games');
      fixture.detectChanges();
      const bar = fixture.debugElement.query(By.css('retro-command-bar'));
      expect(bar.componentInstance.path()).toBe('monchito ~/library/games');
    });

    it('pasa los flags correctos a retro-command-bar', () => {
      fixture.componentRef.setInput('commandPath', 'monchito ~/library/games');
      fixture.componentRef.setInput('commandFlags', ['view=list', 'filters=2']);
      fixture.detectChanges();
      const bar = fixture.debugElement.query(By.css('retro-command-bar'));
      expect(bar.componentInstance.flags()).toEqual(['view=list', 'filters=2']);
    });
  });
});
