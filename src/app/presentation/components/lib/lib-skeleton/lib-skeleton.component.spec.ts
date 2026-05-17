import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibSkeletonComponent } from './lib-skeleton.component';

describe('LibSkeletonComponent', () => {
  let fixture: ComponentFixture<LibSkeletonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LibSkeletonComponent] });
    fixture = TestBed.createComponent(LibSkeletonComponent);
    fixture.detectChanges();
  });

  it('renderiza con defaults correctos', () => {
    const comp = fixture.componentInstance;
    expect(comp.width()).toBe('100%');
    expect(comp.height()).toBe('1rem');
    expect(comp.shape()).toBe('line');
  });

  it('aplica width y height al elemento via ngStyle', () => {
    fixture.componentRef.setInput('width', '120px');
    fixture.componentRef.setInput('height', '48px');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.lib-skeleton');
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('48px');
  });

  it('tiene role="status" y aria-busy="true"', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.lib-skeleton');
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-busy')).toBe('true');
  });

  it('aplica la clase de shape correcta', () => {
    fixture.componentRef.setInput('shape', 'square');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.lib-skeleton');
    expect(el.classList.contains('lib-skeleton--square')).toBe(true);
  });
});
