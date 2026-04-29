import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { ManagementComponent } from './management.component';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';

function configure(isOwner: boolean): ComponentFixture<ManagementComponent> {
  const ownerSignal = signal(isOwner);
  TestBed.configureTestingModule({
    imports: [ManagementComponent],
    providers: [
      {
        provide: UserPreferencesService,
        useValue: { isOwner: computed(() => ownerSignal()) }
      }
    ]
  });
  TestBed.overrideComponent(ManagementComponent, { set: { imports: [], template: '' } });
  return TestBed.createComponent(ManagementComponent);
}

describe('ManagementComponent', () => {
  let component: ManagementComponent;

  describe('cuando el usuario no es owner', () => {
    beforeEach(() => {
      const fixture = configure(false);
      component = fixture.componentInstance;
    });

    it('se crea correctamente', () => expect(component).toBeTruthy());
    it('expone 4 secciones (sin users)', () => expect(component.sections()).toHaveLength(4));
    it('no incluye la sección users', () => {
      expect(component.sections().some((s) => s.route === 'users')).toBe(false);
    });
    it('las secciones tienen icon, label y route', () => {
      component.sections().forEach((s) => {
        expect(s.icon).toBeTruthy();
        expect(s.label).toBeTruthy();
        expect(s.route).toBeTruthy();
      });
    });
  });

  describe('cuando el usuario es owner', () => {
    beforeEach(() => {
      const fixture = configure(true);
      component = fixture.componentInstance;
    });

    it('expone las 5 secciones', () => expect(component.sections()).toHaveLength(5));
    it('incluye la sección users', () => {
      expect(component.sections().some((s) => s.route === 'users')).toBe(true);
    });
  });
});
