import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroIconButtonComponent } from './retro-icon-button.component';

describe('RetroIconButtonComponent', () => {
  let fixture: ComponentFixture<RetroIconButtonComponent>;

  function create(icon = 'close', ariaLabel = 'Cerrar'): ComponentFixture<RetroIconButtonComponent> {
    TestBed.configureTestingModule({ imports: [RetroIconButtonComponent] });
    fixture = TestBed.createComponent(RetroIconButtonComponent);
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
    const libIcon = fixture.nativeElement.querySelector('retro-icon');
    expect(libIcon).toBeTruthy();
    expect(libIcon.querySelector('.retro-icon').textContent.trim()).toBe('close');
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
