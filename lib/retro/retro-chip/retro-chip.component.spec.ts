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

  describe('size variants', () => {
    it('should apply --md modifier by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-chip--md')).toBeTruthy();
    });

    it('should apply --sm modifier when size is sm', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-chip--sm')).toBeTruthy();
    });

    it('should apply --lg modifier when size is lg', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-chip--lg')).toBeTruthy();
    });
  });

  describe('iconSize computed', () => {
    it('iconSize devuelve "sm" cuando size es "lg"', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.componentInstance.iconSize()).toBe('sm');
    });

    it('iconSize devuelve "xs" cuando size es "md"', () => {
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();
      expect(fixture.componentInstance.iconSize()).toBe('xs');
    });

    it('iconSize devuelve "xs" cuando size es "sm"', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.componentInstance.iconSize()).toBe('xs');
    });
  });
});
