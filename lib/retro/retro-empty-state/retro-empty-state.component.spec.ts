import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroEmptyStateComponent } from './retro-empty-state.component';

describe('RetroEmptyStateComponent', () => {
  let fixture: ComponentFixture<RetroEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroEmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroEmptyStateComponent);
    fixture.componentRef.setInput('title', 'NO GAMES FOUND');
    fixture.detectChanges();
  });

  it('should render the ASCII art block', () => {
    expect(fixture.nativeElement.querySelector('.retro-empty__ascii')).toBeTruthy();
  });

  it('should render the required title', () => {
    const title = fixture.nativeElement.querySelector('.retro-empty__title');
    expect(title?.textContent?.trim()).toBe('NO GAMES FOUND');
  });

  it('should render the default hint', () => {
    const hint = fixture.nativeElement.querySelector('.retro-empty__hint');
    expect(hint?.textContent?.trim()).toBe('$ try a different query');
  });

  it('should render subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'Prueba con otro filtro');
    fixture.detectChanges();
    const sub = fixture.nativeElement.querySelector('.retro-empty__subtitle');
    expect(sub?.textContent?.trim()).toBe('Prueba con otro filtro');
  });

  it('should not render subtitle element when subtitle is empty', () => {
    expect(fixture.nativeElement.querySelector('.retro-empty__subtitle')).toBeNull();
  });
});
