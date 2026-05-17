import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroButtonComponent } from './retro-button.component';

describe('RetroButtonComponent', () => {
  let fixture: ComponentFixture<RetroButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroButtonComponent);
    fixture.componentRef.setInput('label', 'TEST');
    fixture.detectChanges();
  });

  it('should render with the required label', () => {
    const label = fixture.nativeElement.querySelector('.retro-btn__label');
    expect(label?.textContent).toBe('TEST');
  });

  it('should apply --primary modifier when variant is primary', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-btn--primary')).toBeTruthy();
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
    const spinIcon = fixture.nativeElement.querySelector('.retro-btn__icon--spin');
    expect(spinIcon).not.toBeNull();
  });

  describe('ng-content slot (SVG projection)', () => {
    @Component({
      template: `
        <retro-button label="With SVG">
          <svg id="test-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /></svg>
        </retro-button>
      `,
      imports: [RetroButtonComponent]
    })
    class TestHostWithSvgComponent {}

    @Component({
      template: `
        <retro-button label="With SVG and icon" icon="star">
          <svg id="test-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /></svg>
        </retro-button>
      `,
      imports: [RetroButtonComponent]
    })
    class TestHostWithSvgAndIconComponent {}

    it('should render projected SVG content in the slot', async () => {
      const hostFixture = TestBed.createComponent(TestHostWithSvgComponent);
      hostFixture.detectChanges();
      const svg = hostFixture.nativeElement.querySelector('#test-svg');
      expect(svg).not.toBeNull();
    });

    it('should render the slot wrapper when SVG is projected with icon input defined', async () => {
      const hostFixture = TestBed.createComponent(TestHostWithSvgAndIconComponent);
      hostFixture.detectChanges();
      const slot = hostFixture.nativeElement.querySelector('.retro-btn__slot');
      const svg = hostFixture.nativeElement.querySelector('#test-svg');
      expect(slot).not.toBeNull();
      expect(svg).not.toBeNull();
    });

    it('should hide the icon (mat-icon) when ng-content has projected SVG (precedence CSS rule)', async () => {
      const hostFixture = TestBed.createComponent(TestHostWithSvgAndIconComponent);
      hostFixture.detectChanges();
      const slot: HTMLElement | null = hostFixture.nativeElement.querySelector('.retro-btn__slot');
      const matIcon: HTMLElement | null = hostFixture.nativeElement.querySelector('.retro-btn__icon');
      expect(slot).not.toBeNull();
      expect(matIcon).not.toBeNull();
      // The slot is non-empty -> sibling .retro-btn__icon must be hidden by CSS rule
      // `.retro-btn__slot:not(:empty) ~ .retro-btn__icon { display: none }`
      const matIconDisplay = (matIcon as HTMLElement).ownerDocument.defaultView?.getComputedStyle(
        matIcon as HTMLElement
      ).display;
      expect(matIconDisplay).toBe('none');
    });
  });
});
