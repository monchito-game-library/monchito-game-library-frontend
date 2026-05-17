import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibSpinnerComponent } from './lib-spinner.component';

describe('LibSpinnerComponent', () => {
  let fixture: ComponentFixture<LibSpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LibSpinnerComponent] });
    fixture = TestBed.createComponent(LibSpinnerComponent);
    fixture.detectChanges();
  });

  it('renderiza con size="md" por defecto', () => {
    const el = fixture.nativeElement.querySelector('span');
    expect(el).toBeTruthy();
    expect(el.classList.contains('lib-spinner--md')).toBe(true);
    expect(el.getAttribute('role')).toBe('status');
  });

  it('aplica la clase de variante correcta cuando se pasa variant="dots"', () => {
    fixture.componentRef.setInput('variant', 'dots');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('span');
    expect(el.classList.contains('lib-spinner--dots')).toBe(true);
    expect(el.classList.contains('lib-spinner--bars')).toBe(false);
  });
});
