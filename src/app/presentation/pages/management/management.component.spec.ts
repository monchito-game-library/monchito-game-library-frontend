import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { ManagementComponent } from './management.component';

describe('ManagementComponent', () => {
  let component: ManagementComponent;
  let fixture: ComponentFixture<ManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ManagementComponent] });
    TestBed.overrideComponent(ManagementComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(ManagementComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());
  it('expone 4 secciones de navegación', () => expect(component.sections).toHaveLength(4));
  it('las secciones tienen icon, label y route', () => {
    component.sections.forEach((s) => {
      expect(s.icon).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.route).toBeTruthy();
    });
  });
});
