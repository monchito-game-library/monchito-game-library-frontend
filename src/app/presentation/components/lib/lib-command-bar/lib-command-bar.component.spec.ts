import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibCommandBarComponent } from './lib-command-bar.component';

describe('LibCommandBarComponent', () => {
  let fixture: ComponentFixture<LibCommandBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibCommandBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibCommandBarComponent);
    fixture.detectChanges();
  });

  it('should render the command bar container', () => {
    expect(fixture.nativeElement.querySelector('.lib-cmd')).toBeTruthy();
  });

  it('should render the default path', () => {
    const path = fixture.nativeElement.querySelector('.lib-cmd__path');
    expect(path?.textContent?.trim()).toBe('monchito ~/library');
  });

  it('should render flags with -- prefix', () => {
    fixture.componentRef.setInput('flags', ['view=list', 'filters=2']);
    fixture.detectChanges();
    const flags = fixture.nativeElement.querySelectorAll('.lib-cmd__flag');
    expect(flags.length).toBe(2);
    expect(flags[0].textContent?.trim()).toBe('--view=list');
  });

  it('should show cursor by default', () => {
    expect(fixture.nativeElement.querySelector('.lib-cmd__cursor')).toBeTruthy();
  });

  it('should hide cursor when cursor is false', () => {
    fixture.componentRef.setInput('cursor', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-cmd__cursor')).toBeNull();
  });
});
