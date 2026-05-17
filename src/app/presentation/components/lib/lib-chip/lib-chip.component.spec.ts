import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibChipComponent } from './lib-chip.component';

describe('LibChipComponent', () => {
  let fixture: ComponentFixture<LibChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibChipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibChipComponent);
    fixture.componentRef.setInput('label', 'OWNED');
    fixture.detectChanges();
  });

  it('should render the chip with the required label', () => {
    const label = fixture.nativeElement.querySelector('.lib-chip__label');
    expect(label?.textContent).toBe('OWNED');
  });

  it('should apply --green modifier when color is green', () => {
    fixture.componentRef.setInput('color', 'green');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-chip--green')).toBeTruthy();
  });

  it('should apply --filled modifier when filled is true', () => {
    fixture.componentRef.setInput('filled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-chip--filled')).toBeTruthy();
  });

  it('should show close button when closable is true', () => {
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-chip__close')).toBeTruthy();
  });

  it('should emit closed when close button is clicked', () => {
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.closed.subscribe(() => {
      emitted = true;
    });
    fixture.nativeElement.querySelector('.lib-chip__close')?.click();
    expect(emitted).toBe(true);
  });
});
