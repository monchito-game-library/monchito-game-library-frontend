import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RetroIconComponent } from './retro-icon.component';

describe('RetroIconComponent', () => {
  let fixture: ComponentFixture<RetroIconComponent>;

  function createComponent(name: string, size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'): void {
    fixture = TestBed.createComponent(RetroIconComponent);
    fixture.componentRef.setInput('name', name);
    if (size) {
      fixture.componentRef.setInput('size', size);
    }
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetroIconComponent]
    });
  });

  it('should render the icon name as text content', () => {
    createComponent('star');
    const span = fixture.debugElement.query(By.css('.retro-icon'));
    expect(span.nativeElement.textContent.trim()).toBe('star');
  });

  it('should apply static host class retro-icon-host', () => {
    createComponent('close');
    expect(fixture.nativeElement.classList.contains('retro-icon-host')).toBe(true);
  });

  it('should apply size host class retro-icon-host--sm when size is sm', () => {
    createComponent('close', 'sm');
    expect(fixture.nativeElement.classList.contains('retro-icon-host--sm')).toBe(true);
  });

  it('should apply size host class retro-icon-host--lg when size is lg', () => {
    createComponent('settings', 'lg');
    expect(fixture.nativeElement.classList.contains('retro-icon-host--lg')).toBe(true);
  });

  it('should not apply other size classes when size is sm', () => {
    createComponent('close', 'sm');
    expect(fixture.nativeElement.classList.contains('retro-icon-host--lg')).toBe(false);
    expect(fixture.nativeElement.classList.contains('retro-icon-host--md')).toBe(false);
  });

  it('should set aria-hidden="true" by default', () => {
    createComponent('menu');
    const span = fixture.debugElement.query(By.css('.retro-icon'));
    expect(span.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('should remove aria-hidden when ariaHidden is false', () => {
    fixture = TestBed.createComponent(RetroIconComponent);
    fixture.componentRef.setInput('name', 'info');
    fixture.componentRef.setInput('ariaHidden', false);
    fixture.detectChanges();
    const span = fixture.debugElement.query(By.css('.retro-icon'));
    expect(span.nativeElement.getAttribute('aria-hidden')).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [RetroIconComponent],
  template: `<retro-icon class="custom-class" name="star" size="md" />`
})
class IconHostComponent {}

describe('RetroIconComponent — preserva clases externas del call-site', () => {
  let fixture: ComponentFixture<IconHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconHostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IconHostComponent);
    fixture.detectChanges();
  });

  it('el host mantiene custom-class, retro-icon-host y retro-icon-host--md a la vez', () => {
    const hostEl: HTMLElement = fixture.nativeElement.querySelector('retro-icon');
    expect(hostEl.classList.contains('custom-class')).toBe(true);
    expect(hostEl.classList.contains('retro-icon-host')).toBe(true);
    expect(hostEl.classList.contains('retro-icon-host--md')).toBe(true);
  });
});
