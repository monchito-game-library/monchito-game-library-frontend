import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibEmptyStateComponent } from './lib-empty-state.component';

describe('LibEmptyStateComponent', () => {
  let fixture: ComponentFixture<LibEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibEmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibEmptyStateComponent);
    fixture.componentRef.setInput('title', 'NO GAMES FOUND');
    fixture.detectChanges();
  });

  it('should render the ASCII art block', () => {
    expect(fixture.nativeElement.querySelector('.lib-empty__ascii')).toBeTruthy();
  });

  it('should render the required title', () => {
    const title = fixture.nativeElement.querySelector('.lib-empty__title');
    expect(title?.textContent?.trim()).toBe('NO GAMES FOUND');
  });

  it('should render the default hint', () => {
    const hint = fixture.nativeElement.querySelector('.lib-empty__hint');
    expect(hint?.textContent?.trim()).toBe('$ try a different query');
  });

  it('should render subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'Prueba con otro filtro');
    fixture.detectChanges();
    const sub = fixture.nativeElement.querySelector('.lib-empty__subtitle');
    expect(sub?.textContent?.trim()).toBe('Prueba con otro filtro');
  });

  it('should not render subtitle element when subtitle is empty', () => {
    expect(fixture.nativeElement.querySelector('.lib-empty__subtitle')).toBeNull();
  });
});
