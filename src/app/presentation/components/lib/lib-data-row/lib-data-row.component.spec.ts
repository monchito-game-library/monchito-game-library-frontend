import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibDataRowComponent } from './lib-data-row.component';

describe('LibDataRowComponent', () => {
  let fixture: ComponentFixture<LibDataRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibDataRowComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibDataRowComponent);
    fixture.componentRef.setInput('label', 'PLATFORM');
    fixture.detectChanges();
  });

  it('should render the label', () => {
    const key = fixture.nativeElement.querySelector('.lib-row__key');
    expect(key?.textContent?.trim()).toContain('PLATFORM');
  });

  it('should render value when provided', () => {
    fixture.componentRef.setInput('value', 'PS5');
    fixture.detectChanges();
    const val = fixture.nativeElement.querySelector('.lib-row__value');
    expect(val?.textContent?.trim()).toBe('PS5');
  });

  it('should apply --emphasized modifier when emphasized is true', () => {
    fixture.componentRef.setInput('emphasized', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-row--emphasized')).toBeTruthy();
  });
});
