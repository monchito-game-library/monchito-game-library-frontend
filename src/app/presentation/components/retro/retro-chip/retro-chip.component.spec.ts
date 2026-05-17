import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroChipComponent } from './retro-chip.component';

describe('RetroChipComponent', () => {
  let fixture: ComponentFixture<RetroChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroChipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroChipComponent);
    fixture.componentRef.setInput('label', 'OWNED');
    fixture.detectChanges();
  });

  it('should render the chip with the required label', () => {
    const label = fixture.nativeElement.querySelector('.retro-chip__label');
    expect(label?.textContent).toBe('OWNED');
  });

  it('should apply --green modifier when color is green', () => {
    fixture.componentRef.setInput('color', 'green');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-chip--green')).toBeTruthy();
  });

  it('should apply --filled modifier when filled is true', () => {
    fixture.componentRef.setInput('filled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-chip--filled')).toBeTruthy();
  });

  it('should show close button when closable is true', () => {
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-chip__close')).toBeTruthy();
  });

  it('should emit closed when close button is clicked', () => {
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.closed.subscribe(() => {
      emitted = true;
    });
    fixture.nativeElement.querySelector('.retro-chip__close')?.click();
    expect(emitted).toBe(true);
  });
});
