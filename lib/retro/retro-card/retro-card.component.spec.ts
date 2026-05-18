import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroCardComponent } from './retro-card.component';

describe('RetroCardComponent', () => {
  let fixture: ComponentFixture<RetroCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroCardComponent);
    fixture.detectChanges();
  });

  it('should render the card container', () => {
    expect(fixture.nativeElement.querySelector('.retro-card')).toBeTruthy();
  });

  it('should apply --padding-md modifier by default', () => {
    expect(fixture.nativeElement.querySelector('.retro-card--padding-md')).toBeTruthy();
  });

  describe('padding', () => {
    it('should apply --padding-none when padding is none', () => {
      fixture.componentRef.setInput('padding', 'none');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--padding-none')).toBeTruthy();
    });

    it('should apply --padding-sm when padding is sm', () => {
      fixture.componentRef.setInput('padding', 'sm');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--padding-sm')).toBeTruthy();
    });

    it('should apply --padding-lg when padding is lg', () => {
      fixture.componentRef.setInput('padding', 'lg');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--padding-lg')).toBeTruthy();
    });

    it('should apply --padding-none when padded=false (deprecated)', () => {
      fixture.componentRef.setInput('padded', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--padding-none')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.retro-card--padding-md')).toBeNull();
    });

    it('should apply --padding-md when padded=true (deprecated)', () => {
      fixture.componentRef.setInput('padded', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--padding-md')).toBeTruthy();
    });

    it('should prioritize padded over padding when both are set', () => {
      fixture.componentRef.setInput('padding', 'lg');
      fixture.componentRef.setInput('padded', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--padding-none')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.retro-card--padding-lg')).toBeNull();
    });
  });

  describe('selected', () => {
    it('should not have --selected class by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-card--selected')).toBeNull();
    });

    it('should apply --selected when selected=true', () => {
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--selected')).toBeTruthy();
    });
  });

  it('should apply --accent modifier when variant is accent', () => {
    fixture.componentRef.setInput('variant', 'accent');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-card--accent')).toBeTruthy();
  });

  it('should add role=button when interactive is true', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.retro-card');
    expect(card?.getAttribute('role')).toBe('button');
  });

  it('should emit cardClicked when interactive card is clicked', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
    fixture.nativeElement.querySelector('.retro-card')?.click();
    expect(emitted.length).toBe(1);
  });
});
