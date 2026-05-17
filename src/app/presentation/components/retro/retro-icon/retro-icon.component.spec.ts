import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RetroIconComponent } from './retro-icon.component';

describe('RetroIconComponent', () => {
  let fixture: ComponentFixture<RetroIconComponent>;

  function createComponent(name: string, size?: 'sm' | 'md' | 'lg'): void {
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

  it('should apply size class --sm when size is sm', () => {
    createComponent('close', 'sm');
    const span = fixture.debugElement.query(By.css('.retro-icon--sm'));
    expect(span).toBeTruthy();
  });

  it('should apply size class --lg when size is lg', () => {
    createComponent('settings', 'lg');
    const span = fixture.debugElement.query(By.css('.retro-icon--lg'));
    expect(span).toBeTruthy();
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
