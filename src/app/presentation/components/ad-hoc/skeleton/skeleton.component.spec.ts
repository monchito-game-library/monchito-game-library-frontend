import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SkeletonComponent] });
    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());
  it('width por defecto es "100%"', () => expect(component.width()).toBe('100%'));
  it('height por defecto es "1rem"', () => expect(component.height()).toBe('1rem'));
  it('borderRadius por defecto es "8px"', () => expect(component.borderRadius()).toBe('8px'));
});
