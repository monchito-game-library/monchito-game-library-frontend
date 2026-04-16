import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { BadgeChipComponent } from './badge-chip.component';

describe('BadgeChipComponent', () => {
  let fixture: ComponentFixture<BadgeChipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BadgeChipComponent] });
    fixture = TestBed.createComponent(BadgeChipComponent);
  });

  describe('label', () => {
    it('renderiza el texto del label', () => {
      fixture.componentRef.setInput('label', 'PS5');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('PS5');
    });

    it('actualiza el texto cuando cambia el label', () => {
      fixture.componentRef.setInput('label', 'Xbox');
      fixture.detectChanges();
      fixture.componentRef.setInput('label', 'PC');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('PC');
    });
  });

  describe('variant — clases de host', () => {
    it('aplica badge-chip y badge-chip--neutral por defecto', () => {
      fixture.componentRef.setInput('label', 'PAL');
      fixture.detectChanges();
      const classList: DOMTokenList = fixture.nativeElement.classList;
      expect(classList.contains('badge-chip')).toBe(true);
      expect(classList.contains('badge-chip--neutral')).toBe(true);
    });

    it('aplica badge-chip--new cuando variant es new', () => {
      fixture.componentRef.setInput('label', 'Nuevo');
      fixture.componentRef.setInput('variant', 'new');
      fixture.detectChanges();
      const classList: DOMTokenList = fixture.nativeElement.classList;
      expect(classList.contains('badge-chip')).toBe(true);
      expect(classList.contains('badge-chip--new')).toBe(true);
    });

    it('aplica badge-chip--used cuando variant es used', () => {
      fixture.componentRef.setInput('label', 'Usado');
      fixture.componentRef.setInput('variant', 'used');
      fixture.detectChanges();
      const classList: DOMTokenList = fixture.nativeElement.classList;
      expect(classList.contains('badge-chip')).toBe(true);
      expect(classList.contains('badge-chip--used')).toBe(true);
    });
  });
});
