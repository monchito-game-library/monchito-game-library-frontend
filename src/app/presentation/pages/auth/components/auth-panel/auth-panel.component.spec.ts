import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { AuthPanelComponent } from './auth-panel.component';

describe('AuthPanelComponent', () => {
  let component: AuthPanelComponent;
  let fixture: ComponentFixture<AuthPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AuthPanelComponent] });
    TestBed.overrideComponent(AuthPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(AuthPanelComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });
});
