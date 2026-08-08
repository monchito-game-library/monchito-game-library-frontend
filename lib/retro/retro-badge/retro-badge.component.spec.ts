import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroBadgeComponent } from './retro-badge.component';

describe('RetroBadgeComponent', () => {
  let fixture: ComponentFixture<RetroBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroBadgeComponent);
    fixture.componentRef.setInput('value', 1);
    fixture.detectChanges();
  });

  it('should render the badge with the required value as "P" prefix by default', () => {
    const label = fixture.nativeElement.querySelector('.retro-badge__label');
    expect(label?.textContent).toBe('P1');
  });

  it('should render only the number when bare is true', () => {
    fixture.componentRef.setInput('bare', true);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.retro-badge__label');
    expect(label?.textContent).toBe('1');
  });

  describe('effectiveVariant auto-mapping', () => {
    it('maps value 1 to rose (highest priority)', () => {
      expect(fixture.componentInstance.effectiveVariant()).toBe('rose');
    });

    it('maps value 2 to amber', () => {
      fixture.componentRef.setInput('value', 2);
      fixture.detectChanges();
      expect(fixture.componentInstance.effectiveVariant()).toBe('amber');
    });

    it('maps value 3 to amber', () => {
      fixture.componentRef.setInput('value', 3);
      fixture.detectChanges();
      expect(fixture.componentInstance.effectiveVariant()).toBe('amber');
    });

    it('maps value 4 to green', () => {
      fixture.componentRef.setInput('value', 4);
      fixture.detectChanges();
      expect(fixture.componentInstance.effectiveVariant()).toBe('green');
    });

    it('maps value 5 to green (lowest priority)', () => {
      fixture.componentRef.setInput('value', 5);
      fixture.detectChanges();
      expect(fixture.componentInstance.effectiveVariant()).toBe('green');
    });

    it('respects explicit variant even when value would auto-map differently', () => {
      fixture.componentRef.setInput('value', 1);
      fixture.componentRef.setInput('variant', 'blue');
      fixture.detectChanges();
      expect(fixture.componentInstance.effectiveVariant()).toBe('blue');
      expect(fixture.nativeElement.querySelector('.retro-badge--blue')).toBeTruthy();
    });
  });

  describe('size variants', () => {
    it('applies --md modifier by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-badge--md')).toBeTruthy();
    });

    it('applies --sm modifier when size is sm', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-badge--sm')).toBeTruthy();
    });

    it('applies --lg modifier when size is lg', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-badge--lg')).toBeTruthy();
    });
  });

  describe('color variants', () => {
    it.each(['primary', 'green', 'amber', 'rose', 'blue', 'neutral'] as const)(
      'applies --%s modifier when variant is %s',
      (variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector(`.retro-badge--${variant}`)).toBeTruthy();
      }
    );
  });

  describe('tooltip', () => {
    it('uses tooltip input as title attribute when provided', () => {
      fixture.componentRef.setInput('tooltip', 'Prioridad alta');
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.retro-badge');
      expect(span.getAttribute('title')).toBe('Prioridad alta');
    });

    it('falls back to displayLabel when tooltip is not provided', () => {
      const span = fixture.nativeElement.querySelector('.retro-badge');
      expect(span.getAttribute('title')).toBe('P1');
    });
  });

  describe('iconSize computed', () => {
    it('returns "xs" when size is "sm"', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.componentInstance.iconSize()).toBe('xs');
    });

    it('returns "sm" when size is "md"', () => {
      expect(fixture.componentInstance.iconSize()).toBe('sm');
    });

    it('returns "sm" when size is "lg"', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.componentInstance.iconSize()).toBe('sm');
    });
  });
});
