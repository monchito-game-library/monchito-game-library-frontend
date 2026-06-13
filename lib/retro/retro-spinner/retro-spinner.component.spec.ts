import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroSpinnerComponent } from './retro-spinner.component';

describe('RetroSpinnerComponent', () => {
  let fixture: ComponentFixture<RetroSpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RetroSpinnerComponent] });
    fixture = TestBed.createComponent(RetroSpinnerComponent);
    fixture.detectChanges();
  });

  it('renderiza con size="md" por defecto', () => {
    const el = fixture.nativeElement.querySelector('span');
    expect(el).toBeTruthy();
    expect(el.classList.contains('retro-spinner--md')).toBe(true);
    expect(el.getAttribute('role')).toBe('status');
  });

  it('aplica la clase de variante correcta cuando se pasa variant="dots"', () => {
    fixture.componentRef.setInput('variant', 'dots');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('span');
    expect(el.classList.contains('retro-spinner--dots')).toBe(true);
    expect(el.classList.contains('retro-spinner--bars')).toBe(false);
  });
});
