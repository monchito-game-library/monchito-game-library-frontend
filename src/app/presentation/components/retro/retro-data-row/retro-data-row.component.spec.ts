import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroDataRowComponent } from './retro-data-row.component';

describe('RetroDataRowComponent', () => {
  let fixture: ComponentFixture<RetroDataRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroDataRowComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroDataRowComponent);
    fixture.componentRef.setInput('label', 'PLATFORM');
    fixture.detectChanges();
  });

  it('should render the label', () => {
    const key = fixture.nativeElement.querySelector('.retro-row__key');
    expect(key?.textContent?.trim()).toContain('PLATFORM');
  });

  it('should render value when provided', () => {
    fixture.componentRef.setInput('value', 'PS5');
    fixture.detectChanges();
    const val = fixture.nativeElement.querySelector('.retro-row__value');
    expect(val?.textContent?.trim()).toBe('PS5');
  });

  it('should apply --emphasized modifier when emphasized is true', () => {
    fixture.componentRef.setInput('emphasized', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-row--emphasized')).toBeTruthy();
  });
});
