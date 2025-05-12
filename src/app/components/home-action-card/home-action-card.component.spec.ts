import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeActionCardComponent } from './home-action-card.component';

describe('HomeActionCardComponent', () => {
  let component: HomeActionCardComponent;
  let fixture: ComponentFixture<HomeActionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeActionCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeActionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
