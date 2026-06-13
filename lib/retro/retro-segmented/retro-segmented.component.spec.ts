import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetroSegmentedComponent } from './retro-segmented.component';

describe('RetroSegmentedComponent', () => {
  let component: RetroSegmentedComponent<string>;
  let fixture: ComponentFixture<RetroSegmentedComponent<string>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroSegmentedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent<RetroSegmentedComponent<string>>(RetroSegmentedComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
