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

  it('should emit cardClicked on Enter when interactive=true and not disabled', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
    const card: HTMLElement = fixture.nativeElement.querySelector('.retro-card');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(emitted.length).toBe(1);
  });

  it('should emit cardClicked on Space when interactive=true and not disabled', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
    const card: HTMLElement = fixture.nativeElement.querySelector('.retro-card');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(emitted.length).toBe(1);
  });

  describe('hoverable', () => {
    it('should not have --hoverable class by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-card--hoverable')).toBeNull();
    });

    it('should apply --hoverable when hoverable=true', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--hoverable')).toBeTruthy();
    });

    it('should apply --hoverable implicitly when interactive=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--hoverable')).toBeTruthy();
    });

    it('should not apply --hoverable when disabled=true even if hoverable=true', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--hoverable')).toBeNull();
    });

    it('should not apply --hoverable when disabled=true even if interactive=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--hoverable')).toBeNull();
    });

    it('should not add role=button when only hoverable=true', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.retro-card');
      expect(card?.getAttribute('role')).toBeNull();
    });

    it('should not add tabindex when only hoverable=true', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.retro-card');
      expect(card?.getAttribute('tabindex')).toBeNull();
    });

    it('should not emit cardClicked when only hoverable=true and clicked', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.detectChanges();
      const emitted: MouseEvent[] = [];
      fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
      fixture.nativeElement.querySelector('.retro-card')?.click();
      expect(emitted.length).toBe(0);
    });
  });

  describe('disabled', () => {
    it('should not have --disabled class by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-card--disabled')).toBeNull();
    });

    it('should apply --disabled when disabled=true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-card--disabled')).toBeTruthy();
    });

    it('should set aria-disabled="true" when disabled=true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.retro-card');
      expect(card?.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not set aria-disabled when disabled=false', () => {
      const card = fixture.nativeElement.querySelector('.retro-card');
      expect(card?.getAttribute('aria-disabled')).toBeNull();
    });

    it('should set tabindex="-1" when interactive=true and disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.retro-card');
      expect(card?.getAttribute('tabindex')).toBe('-1');
    });

    it('should keep tabindex null when disabled=true and interactive=false', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.retro-card');
      expect(card?.getAttribute('tabindex')).toBeNull();
    });

    it('should not emit cardClicked when interactive=true but disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitted: MouseEvent[] = [];
      fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
      fixture.nativeElement.querySelector('.retro-card')?.click();
      expect(emitted.length).toBe(0);
    });

    it('should not emit cardClicked on Enter when disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitted: MouseEvent[] = [];
      fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
      const card: HTMLElement = fixture.nativeElement.querySelector('.retro-card');
      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(emitted.length).toBe(0);
    });

    it('should not emit cardClicked on Space when disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitted: MouseEvent[] = [];
      fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
      const card: HTMLElement = fixture.nativeElement.querySelector('.retro-card');
      card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(emitted.length).toBe(0);
    });

    it('should still expose role=button when interactive=true and disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.retro-card');
      expect(card?.getAttribute('role')).toBe('button');
    });
  });
});
