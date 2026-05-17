import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibIconButtonComponent } from './lib-icon-button.component';

describe('LibIconButtonComponent', () => {
  let fixture: ComponentFixture<LibIconButtonComponent>;

  function create(icon = 'close', ariaLabel = 'Cerrar'): ComponentFixture<LibIconButtonComponent> {
    TestBed.configureTestingModule({ imports: [LibIconButtonComponent] });
    fixture = TestBed.createComponent(LibIconButtonComponent);
    fixture.componentRef.setInput('icon', icon);
    fixture.componentRef.setInput('ariaLabel', ariaLabel);
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza con icon y ariaLabel', () => {
    create('close', 'Cerrar');
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-label')).toBe('Cerrar');
    const libIcon = fixture.nativeElement.querySelector('app-lib-icon');
    expect(libIcon).toBeTruthy();
    expect(libIcon.querySelector('.lib-icon').textContent.trim()).toBe('close');
  });

  it('emite clicked al pulsar', () => {
    create('delete', 'Eliminar');
    let emitted = false;
    fixture.componentInstance.clicked.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toBe(true);
  });

  it('no emite cuando está deshabilitado', () => {
    create('delete', 'Eliminar');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.clicked.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toBe(false);
  });
});
