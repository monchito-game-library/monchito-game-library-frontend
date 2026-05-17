import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibButtonComponent } from './lib-button.component';

describe('LibButtonComponent', () => {
  let fixture: ComponentFixture<LibButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibButtonComponent);
    fixture.componentRef.setInput('label', 'TEST');
    fixture.detectChanges();
  });

  it('should render with the required label', () => {
    const label = fixture.nativeElement.querySelector('.lib-btn__label');
    expect(label?.textContent).toBe('TEST');
  });

  it('should apply --primary modifier when variant is primary', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-btn--primary')).toBeTruthy();
  });

  it('should disable the button when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn?.disabled).toBe(true);
  });

  it('should show spinner icon when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinIcon = fixture.nativeElement.querySelector('.lib-btn__icon--spin');
    expect(spinIcon).not.toBeNull();
  });
});
