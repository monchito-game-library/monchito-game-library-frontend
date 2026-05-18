import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroListItemComponent, RETRO_LIST_ITEM_PARENT_REQUIRED_ERROR } from './retro-list-item.component';
import { RetroListComponent } from '../retro-list/retro-list.component';
import { RetroListItemVariant, RetroListItemPadding } from './retro-list-item.types';

/** Componente host para tests de RetroListItemComponent dentro de su padre retro-list. */
@Component({
  template: `<retro-list
    ><retro-list-item
      [interactive]="interactive"
      [variant]="variant"
      [padding]="padding"
      [selected]="selected"
      [hoverable]="hoverable"
      [disabled]="disabled"
      [staggered]="staggered"
      (itemClicked)="onItemClicked($event)"
      >Content</retro-list-item
    ></retro-list
  >`,
  standalone: true,
  imports: [RetroListComponent, RetroListItemComponent]
})
class TestHostComponent {
  interactive = false;
  variant: RetroListItemVariant = 'default';
  padding: RetroListItemPadding = 'sm';
  selected = false;
  hoverable = false;
  disabled = false;
  staggered = false;
  lastEvent: MouseEvent | null = null;
  /**
   * Captura el evento emitido por itemClicked para aserción en tests.
   *
   * @param {MouseEvent} e - Evento emitido por retro-list-item.
   */
  onItemClicked(e: MouseEvent): void {
    this.lastEvent = e;
  }
}

describe('RetroListItemComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let itemEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    itemEl = hostFixture.nativeElement.querySelector('.retro-list-item');
  });

  it('should render the list item container', () => {
    expect(itemEl).toBeTruthy();
  });

  it('should apply --padding-sm modifier by default', () => {
    expect(hostFixture.nativeElement.querySelector('.retro-list-item--padding-sm')).toBeTruthy();
  });

  describe('padding', () => {
    it('should apply --padding-none when padding is none', () => {
      hostFixture.componentInstance.padding = 'none';
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--padding-none')).toBeTruthy();
    });

    it('should apply --padding-md when padding is md', () => {
      hostFixture.componentInstance.padding = 'md';
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--padding-md')).toBeTruthy();
    });

    it('should apply --padding-lg when padding is lg', () => {
      hostFixture.componentInstance.padding = 'lg';
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--padding-lg')).toBeTruthy();
    });
  });

  describe('selected', () => {
    it('should not have --selected class by default', () => {
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--selected')).toBeNull();
    });

    it('should apply --selected when selected=true', () => {
      hostFixture.componentInstance.selected = true;
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--selected')).toBeTruthy();
    });
  });

  it('should apply --accent modifier when variant is accent', () => {
    hostFixture.componentInstance.variant = 'accent';
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.querySelector('.retro-list-item--accent')).toBeTruthy();
  });

  it('should apply --muted modifier when variant is muted', () => {
    hostFixture.componentInstance.variant = 'muted';
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.querySelector('.retro-list-item--muted')).toBeTruthy();
  });

  it('should add role=button when interactive is true', () => {
    hostFixture.componentInstance.interactive = true;
    hostFixture.detectChanges();
    const item = hostFixture.nativeElement.querySelector('.retro-list-item');
    expect(item?.getAttribute('role')).toBe('button');
  });

  it('should emit itemClicked when interactive item is clicked', () => {
    hostFixture.componentInstance.interactive = true;
    hostFixture.detectChanges();
    hostFixture.nativeElement.querySelector('.retro-list-item')?.click();
    expect(hostFixture.componentInstance.lastEvent).toBeTruthy();
  });

  it('should emit itemClicked on Enter when interactive=true and not disabled', () => {
    hostFixture.componentInstance.interactive = true;
    hostFixture.detectChanges();
    const item: HTMLElement = hostFixture.nativeElement.querySelector('.retro-list-item');
    item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(hostFixture.componentInstance.lastEvent).toBeTruthy();
  });

  it('should emit itemClicked on Space when interactive=true and not disabled', () => {
    hostFixture.componentInstance.interactive = true;
    hostFixture.detectChanges();
    const item: HTMLElement = hostFixture.nativeElement.querySelector('.retro-list-item');
    item.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(hostFixture.componentInstance.lastEvent).toBeTruthy();
  });

  describe('hoverable', () => {
    it('should not have --hoverable class by default', () => {
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeNull();
    });

    it('should apply --hoverable when hoverable=true', () => {
      hostFixture.componentInstance.hoverable = true;
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeTruthy();
    });

    it('should apply --hoverable implicitly when interactive=true', () => {
      hostFixture.componentInstance.interactive = true;
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeTruthy();
    });

    it('should not apply --hoverable when disabled=true even if hoverable=true', () => {
      hostFixture.componentInstance.hoverable = true;
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeNull();
    });

    it('should not apply --hoverable when disabled=true even if interactive=true', () => {
      hostFixture.componentInstance.interactive = true;
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--hoverable')).toBeNull();
    });

    it('should not add role=button when only hoverable=true', () => {
      hostFixture.componentInstance.hoverable = true;
      hostFixture.detectChanges();
      const item = hostFixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('role')).toBeNull();
    });

    it('should not add tabindex when only hoverable=true', () => {
      hostFixture.componentInstance.hoverable = true;
      hostFixture.detectChanges();
      const item = hostFixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('tabindex')).toBeNull();
    });

    it('should not emit itemClicked when only hoverable=true and clicked', () => {
      hostFixture.componentInstance.hoverable = true;
      hostFixture.detectChanges();
      hostFixture.nativeElement.querySelector('.retro-list-item')?.click();
      expect(hostFixture.componentInstance.lastEvent).toBeNull();
    });
  });

  describe('disabled', () => {
    it('should not have --disabled class by default', () => {
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--disabled')).toBeNull();
    });

    it('should apply --disabled when disabled=true', () => {
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--disabled')).toBeTruthy();
    });

    it('should set aria-disabled="true" when disabled=true', () => {
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      const item = hostFixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not set aria-disabled when disabled=false', () => {
      const item = hostFixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('aria-disabled')).toBeNull();
    });

    it('should set tabindex="-1" when interactive=true and disabled=true', () => {
      hostFixture.componentInstance.interactive = true;
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      const item = hostFixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('tabindex')).toBe('-1');
    });

    it('should keep tabindex null when disabled=true and interactive=false', () => {
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      const item = hostFixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('tabindex')).toBeNull();
    });

    it('should not emit itemClicked when interactive=true but disabled=true', () => {
      hostFixture.componentInstance.interactive = true;
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      hostFixture.nativeElement.querySelector('.retro-list-item')?.click();
      expect(hostFixture.componentInstance.lastEvent).toBeNull();
    });

    it('should not emit itemClicked on Enter when disabled=true', () => {
      hostFixture.componentInstance.interactive = true;
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      const item: HTMLElement = hostFixture.nativeElement.querySelector('.retro-list-item');
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(hostFixture.componentInstance.lastEvent).toBeNull();
    });

    it('should not emit itemClicked on Space when disabled=true', () => {
      hostFixture.componentInstance.interactive = true;
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      const item: HTMLElement = hostFixture.nativeElement.querySelector('.retro-list-item');
      item.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(hostFixture.componentInstance.lastEvent).toBeNull();
    });

    it('should still expose role=button when interactive=true and disabled=true', () => {
      hostFixture.componentInstance.interactive = true;
      hostFixture.componentInstance.disabled = true;
      hostFixture.detectChanges();
      const item = hostFixture.nativeElement.querySelector('.retro-list-item');
      expect(item?.getAttribute('role')).toBe('button');
    });
  });

  describe('staggered', () => {
    it('should not apply --staggered class by default', () => {
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--staggered')).toBeNull();
    });

    it('should apply --staggered class when staggered=true', () => {
      hostFixture.componentInstance.staggered = true;
      hostFixture.detectChanges();
      expect(hostFixture.nativeElement.querySelector('.retro-list-item--staggered')).toBeTruthy();
    });
  });

  describe('guards', () => {
    it('should throw when used outside a retro-list', () => {
      @Component({
        template: `<retro-list-item>orphan</retro-list-item>`,
        standalone: true,
        imports: [RetroListItemComponent]
      })
      class OrphanHostComponent {}

      TestBed.configureTestingModule({ imports: [OrphanHostComponent] });
      const orphanFixture = TestBed.createComponent(OrphanHostComponent);
      expect(() => orphanFixture.detectChanges()).toThrowError(RETRO_LIST_ITEM_PARENT_REQUIRED_ERROR);
    });

    it('should not throw when used inside a retro-list', () => {
      expect(() => hostFixture.detectChanges()).not.toThrow();
    });
  });
});

@Component({
  standalone: true,
  imports: [RetroListComponent, RetroListItemComponent],
  template: `
    <retro-list>
      <retro-list-item>
        <span retroListItemLeading>L</span>
        BODY
        <span retroListItemTrailing>T</span>
      </retro-list-item>
    </retro-list>
  `
})
class SlotsHostComponent {}

describe('RetroListItemComponent — slots', () => {
  let hostFixture: ComponentFixture<SlotsHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotsHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(SlotsHostComponent);
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
