import { Component } from '@angular/core';
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

  describe('ng-content slot (SVG projection)', () => {
    @Component({
      template: `
        <retro-button label="With SVG">
          <svg id="test-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /></svg>
        </retro-button>
      `,
      imports: [LibButtonComponent]
    })
    class TestHostWithSvgComponent {}

    @Component({
      template: `
        <retro-button label="With SVG and icon" icon="star">
          <svg id="test-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /></svg>
        </retro-button>
      `,
      imports: [LibButtonComponent]
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
      const slot = hostFixture.nativeElement.querySelector('.lib-btn__slot');
      const svg = hostFixture.nativeElement.querySelector('#test-svg');
      expect(slot).not.toBeNull();
      expect(svg).not.toBeNull();
    });

    it('should hide the icon (mat-icon) when ng-content has projected SVG (precedence CSS rule)', async () => {
      const hostFixture = TestBed.createComponent(TestHostWithSvgAndIconComponent);
      hostFixture.detectChanges();
      const slot: HTMLElement | null = hostFixture.nativeElement.querySelector('.lib-btn__slot');
      const matIcon: HTMLElement | null = hostFixture.nativeElement.querySelector('.lib-btn__icon');
      expect(slot).not.toBeNull();
      expect(matIcon).not.toBeNull();
      // The slot is non-empty -> sibling .lib-btn__icon must be hidden by CSS rule
      // `.lib-btn__slot:not(:empty) ~ .lib-btn__icon { display: none }`
      const matIconDisplay = (matIcon as HTMLElement).ownerDocument.defaultView?.getComputedStyle(
        matIcon as HTMLElement
      ).display;
      expect(matIconDisplay).toBe('none');
    });
  });
});
