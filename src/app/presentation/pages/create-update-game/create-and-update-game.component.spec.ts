import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { CreateAndUpdateGameComponent } from './create-and-update-game.component';

describe('CreateAndUpdateGameComponent', () => {
  let component: CreateAndUpdateGameComponent;
  let fixture: ComponentFixture<CreateAndUpdateGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CreateAndUpdateGameComponent] });
    TestBed.overrideComponent(CreateAndUpdateGameComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(CreateAndUpdateGameComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());
});

describe('CreateAndUpdateGameComponent — template real', () => {
  let component: CreateAndUpdateGameComponent;
  let fixture: ComponentFixture<CreateAndUpdateGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateAndUpdateGameComponent]
    });
    TestBed.overrideComponent(CreateAndUpdateGameComponent, {
      set: { imports: [], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    });
    fixture = TestBed.createComponent(CreateAndUpdateGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se renderiza con el template real sin errores', () => {
    expect(component).toBeTruthy();
  });
});
