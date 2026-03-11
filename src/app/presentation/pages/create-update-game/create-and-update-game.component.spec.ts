import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAndUpdateGameComponent } from './create-and-update-game.component';

describe('UpdateGameComponent', () => {
  let component: CreateAndUpdateGameComponent;
  let fixture: ComponentFixture<CreateAndUpdateGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAndUpdateGameComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAndUpdateGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
