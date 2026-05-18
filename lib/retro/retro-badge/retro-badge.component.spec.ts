import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroBadgeComponent } from './retro-badge.component';

describe('RetroBadgeComponent', () => {
  let fixture: ComponentFixture<RetroBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroBadgeComponent);
    fixture.componentRef.setInput('label', 3);
    fixture.detectChanges();
  });

  it('should render the label', () => {
    const badge = fixture.nativeElement.querySelector('.retro-badge');
    expect(badge?.textContent?.trim()).toBe('3');
  });

  it('should apply --primary modifier when variant is primary', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-badge--primary')).toBeTruthy();
  });

  it('should apply --dot modifier and hide label when dot is true', () => {
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-badge--dot')).toBeTruthy();
    const badge = fixture.nativeElement.querySelector('.retro-badge');
    expect(badge?.textContent?.trim()).toBe('');
  });
});
