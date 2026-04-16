import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, expect, it } from 'vitest';

import { HardwareManagementComponent } from './hardware-management.component';

describe('HardwareManagementComponent', () => {
  let fixture: ComponentFixture<HardwareManagementComponent>;
  let component: HardwareManagementComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HardwareManagementComponent],
      providers: [provideRouter([])]
    });

    fixture = TestBed.createComponent(HardwareManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza el router-outlet', () => {
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).not.toBeNull();
  });
});
