import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroButtonComponent } from './retro-button.component';
import { RetroIconComponent } from '../retro-icon/retro-icon.component';

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

  describe('size', () => {
    it('should apply --lg modifier by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-btn--lg')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.retro-btn--sm')).toBeNull();
      expect(fixture.nativeElement.querySelector('.retro-btn--md')).toBeNull();
    });

    it('should apply --sm modifier when size is sm', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-btn--sm')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.retro-btn--lg')).toBeNull();
    });

    it('should apply --md modifier when size is md', () => {
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-btn--md')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.retro-btn--lg')).toBeNull();
    });

    it('should apply --lg modifier when size is lg', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-btn--lg')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.retro-btn--sm')).toBeNull();
      expect(fixture.nativeElement.querySelector('.retro-btn--md')).toBeNull();
    });
  });

  describe('named slots', () => {
    @Component({
      template: `
        <retro-button label="With start slot">
          <retro-icon slot="start" name="save" size="sm" />
        </retro-button>
      `,
      imports: [RetroButtonComponent, RetroIconComponent]
    })
    class TestHostWithStartSlotComponent {}

    @Component({
      template: `
        <retro-button label="With end slot">
          <retro-icon slot="end" name="chevron_right" size="sm" />
        </retro-button>
      `,
      imports: [RetroButtonComponent, RetroIconComponent]
    })
    class TestHostWithEndSlotComponent {}

    @Component({
      template: `
        <retro-button label="With both slots">
          <retro-icon slot="start" name="save" size="sm" />
          <retro-icon slot="end" name="chevron_right" size="sm" />
        </retro-button>
      `,
      imports: [RetroButtonComponent, RetroIconComponent]
    })
    class TestHostWithBothSlotsComponent {}

    @Component({
      template: `<retro-button label="No slots" />`,
      imports: [RetroButtonComponent]
    })
    class TestHostNoSlotsComponent {}

    @Component({
      template: `
        <retro-button label="Loading with start" [loading]="true">
          <retro-icon slot="start" name="save" size="sm" />
        </retro-button>
      `,
      imports: [RetroButtonComponent, RetroIconComponent]
    })
    class TestHostLoadingWithStartComponent {}

    it('should project retro-icon into slot--start', () => {
      const hostFixture = TestBed.createComponent(TestHostWithStartSlotComponent);
      hostFixture.detectChanges();
      const startSlot = hostFixture.nativeElement.querySelector('.retro-btn__slot--start');
      expect(startSlot).not.toBeNull();
      const icon = startSlot?.querySelector('retro-icon');
      expect(icon).not.toBeNull();
    });

    it('should project retro-icon into slot--end', () => {
      const hostFixture = TestBed.createComponent(TestHostWithEndSlotComponent);
      hostFixture.detectChanges();
      const endSlot = hostFixture.nativeElement.querySelector('.retro-btn__slot--end');
      expect(endSlot).not.toBeNull();
      const icon = endSlot?.querySelector('retro-icon');
      expect(icon).not.toBeNull();
    });

    it('should render both slots simultaneously when both are projected', () => {
      const hostFixture = TestBed.createComponent(TestHostWithBothSlotsComponent);
      hostFixture.detectChanges();
      const startSlot = hostFixture.nativeElement.querySelector('.retro-btn__slot--start');
      const endSlot = hostFixture.nativeElement.querySelector('.retro-btn__slot--end');
      expect(startSlot?.querySelector('retro-icon')).not.toBeNull();
      expect(endSlot?.querySelector('retro-icon')).not.toBeNull();
    });

    it('should render slot--start with no content when no projection is used', () => {
      const hostFixture = TestBed.createComponent(TestHostNoSlotsComponent);
      hostFixture.detectChanges();
      const startSlot: HTMLElement | null = hostFixture.nativeElement.querySelector('.retro-btn__slot--start');
      expect(startSlot).not.toBeNull();
      expect(startSlot?.children.length).toBe(0);
    });

    it('should show spinner and not render slot--start when loading is true', () => {
      const hostFixture = TestBed.createComponent(TestHostLoadingWithStartComponent);
      hostFixture.detectChanges();
      const spinIcon = hostFixture.nativeElement.querySelector('.retro-btn__icon--spin');
      const startSlot = hostFixture.nativeElement.querySelector('.retro-btn__slot--start');
      const endSlot = hostFixture.nativeElement.querySelector('.retro-btn__slot--end');
      expect(spinIcon).not.toBeNull();
      expect(startSlot).toBeNull();
      expect(endSlot).toBeNull();
    });
  });
});
