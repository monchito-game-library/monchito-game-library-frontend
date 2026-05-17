import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibBadgeComponent } from './lib-badge.component';

describe('LibBadgeComponent', () => {
  let fixture: ComponentFixture<LibBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibBadgeComponent);
    fixture.componentRef.setInput('label', 3);
    fixture.detectChanges();
  });

  it('should render the label', () => {
    const badge = fixture.nativeElement.querySelector('.lib-badge');
    expect(badge?.textContent?.trim()).toBe('3');
  });

  it('should apply --primary modifier when variant is primary', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-badge--primary')).toBeTruthy();
  });

  it('should apply --dot modifier and hide label when dot is true', () => {
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-badge--dot')).toBeTruthy();
    const badge = fixture.nativeElement.querySelector('.lib-badge');
    expect(badge?.textContent?.trim()).toBe('');
  });
});
