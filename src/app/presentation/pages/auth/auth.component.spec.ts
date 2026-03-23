import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, expect, it } from 'vitest';

import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [provideRouter([])]
    });
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());
});
