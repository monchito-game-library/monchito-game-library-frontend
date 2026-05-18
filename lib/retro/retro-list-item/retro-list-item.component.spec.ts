import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroListItemComponent } from './retro-list-item.component';

describe('RetroListItemComponent', () => {
  let fixture: ComponentFixture<RetroListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroListItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroListItemComponent);
    fixture.detectChanges();
  });

  it('should render the list item container', () => {
    expect(fixture.nativeElement.querySelector('.retro-list-item')).toBeTruthy();
  });

  it('should apply --padding-sm modifier by default', () => {
    expect(fixture.nativeElement.querySelector('.retro-list-item--padding-sm')).toBeTruthy();
  });

  describe('padding', () => {
    it('should apply --padding-none when padding is none', () => {
      fixture.componentRef.setInput('padding', 'none');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--padding-none')).toBeTruthy();
    });

    it('should apply --padding-md when padding is md', () => {
      fixture.componentRef.setInput('padding', 'md');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--padding-md')).toBeTruthy();
    });

    it('should apply --padding-lg when padding is lg', () => {
      fixture.componentRef.setInput('padding', 'lg');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--padding-lg')).toBeTruthy();
    });
  });

  describe('selected', () => {
    it('should not have --selected class by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-list-item--selected')).toBeNull();
    });

    it('should apply --selected when selected=true', () => {
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--selected')).toBeTruthy();
    });
  });

  it('should apply --accent modifier when variant is accent', () => {
    fixture.componentRef.setInput('variant', 'accent');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-list-item--accent')).toBeTruthy();
  });

  it('should apply --muted modifier when variant is muted', () => {
    fixture.componentRef.setInput('variant', 'muted');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-list-item--muted')).toBeTruthy();
  });

  it('should add role=button when interactive is true', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('.retro-list-item');
    expect(item?.getAttribute('role')).toBe('button');
  });

  it('should emit itemClicked when interactive item is clicked', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.itemClicked.subscribe((e: MouseEvent) => emitted.push(e));
    fixture.nativeElement.querySelector('.retro-list-item')?.click();
    expect(emitted.length).toBe(1);
  });

  it('should emit itemClicked on Enter when interactive=true and not disabled', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.itemClicked.subscribe((e: MouseEvent) => emitted.push(e));
    const item: HTMLElement = fixture.nativeElement.querySelector('.retro-list-item');
    item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(emitted.length).toBe(1);
  });

  it('should emit itemClicked on Space when interactive=true and not disabled', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.itemClicked.subscribe((e: MouseEvent) => emitted.push(e));
    const item: HTMLElement = fixture.nativeElement.querySelector('.retro-list-item');
    item.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(emitted.length).toBe(1);
  });

  describe('hoverable', () => {
    it('should not have --hoverable class by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeNull();
    });

    it('should apply --hoverable when hoverable=true', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeTruthy();
    });

    it('should apply --hoverable implicitly when interactive=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeTruthy();
    });

    it('should not apply --hoverable when disabled=true even if hoverable=true', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeNull();
    });

    it('should not apply --hoverable when disabled=true even if interactive=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeNull();
    });

    it('should not add role=button when only hoverable=true', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.detectChanges();
      const item = fixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('role')).toBeNull();
    });

    it('should not add tabindex when only hoverable=true', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.detectChanges();
      const item = fixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('tabindex')).toBeNull();
    });

    it('should not emit itemClicked when only hoverable=true and clicked', () => {
      fixture.componentRef.setInput('hoverable', true);
      fixture.detectChanges();
      const emitted: MouseEvent[] = [];
      fixture.componentInstance.itemClicked.subscribe((e: MouseEvent) => emitted.push(e));
      fixture.nativeElement.querySelector('.retro-list-item')?.click();
      expect(emitted.length).toBe(0);
    });
  });

  describe('disabled', () => {
    it('should not have --disabled class by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-list-item--disabled')).toBeNull();
    });

    it('should apply --disabled when disabled=true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--disabled')).toBeTruthy();
    });

    it('should set aria-disabled="true" when disabled=true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const item = fixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not set aria-disabled when disabled=false', () => {
      const item = fixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('aria-disabled')).toBeNull();
    });

    it('should set tabindex="-1" when interactive=true and disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const item = fixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('tabindex')).toBe('-1');
    });

    it('should keep tabindex null when disabled=true and interactive=false', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const item = fixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('tabindex')).toBeNull();
    });

    it('should not emit itemClicked when interactive=true but disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitted: MouseEvent[] = [];
      fixture.componentInstance.itemClicked.subscribe((e: MouseEvent) => emitted.push(e));
      fixture.nativeElement.querySelector('.retro-list-item')?.click();
      expect(emitted.length).toBe(0);
    });

    it('should not emit itemClicked on Enter when disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitted: MouseEvent[] = [];
      fixture.componentInstance.itemClicked.subscribe((e: MouseEvent) => emitted.push(e));
      const item: HTMLElement = fixture.nativeElement.querySelector('.retro-list-item');
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(emitted.length).toBe(0);
    });

    it('should not emit itemClicked on Space when disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitted: MouseEvent[] = [];
      fixture.componentInstance.itemClicked.subscribe((e: MouseEvent) => emitted.push(e));
      const item: HTMLElement = fixture.nativeElement.querySelector('.retro-list-item');
      item.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(emitted.length).toBe(0);
    });

    it('should still expose role=button when interactive=true and disabled=true', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const item = fixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('role')).toBe('button');
    });
  });

  describe('staggered', () => {
    it('should not apply --staggered class by default', () => {
      expect(fixture.nativeElement.querySelector('.retro-list-item--staggered')).toBeNull();
    });

    it('should apply --staggered class when staggered=true', () => {
      fixture.componentRef.setInput('staggered', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.retro-list-item--staggered')).toBeTruthy();
    });
  });
});

@Component({
  standalone: true,
  imports: [RetroListItemComponent],
  template: `
    <retro-list-item>
      <span retroListItemLeading>L</span>
      BODY
      <span retroListItemTrailing>T</span>
    </retro-list-item>
  `
})
class TestHostComponent {}

describe('RetroListItemComponent — slots', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should project leading content into __leading slot', () => {
    const leading = hostFixture.nativeElement.querySelector('.retro-list-item__leading');
    expect(leading?.textContent?.trim()).toContain('L');
  });

  it('should project default content into __body slot', () => {
    const body = hostFixture.nativeElement.querySelector('.retro-list-item__body');
    expect(body?.textContent?.trim()).toContain('BODY');
  });

  it('should project trailing content into __trailing slot', () => {
    const trailing = hostFixture.nativeElement.querySelector('.retro-list-item__trailing');
    expect(trailing?.textContent?.trim()).toContain('T');
  });
});
