import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, expect, it } from 'vitest';

import { OrdersComponent } from './orders.component';

describe('OrdersComponent', () => {
  let fixture: ComponentFixture<OrdersComponent>;
  let component: OrdersComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrdersComponent],
      providers: [provideRouter([])]
    });

    fixture = TestBed.createComponent(OrdersComponent);
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
