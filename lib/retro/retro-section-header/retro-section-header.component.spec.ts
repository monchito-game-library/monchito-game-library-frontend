import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroSectionHeaderComponent } from './retro-section-header.component';

describe('RetroSectionHeaderComponent', () => {
  let fixture: ComponentFixture<RetroSectionHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroSectionHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroSectionHeaderComponent);
    fixture.componentRef.setInput('label', 'OPINION');
    fixture.detectChanges();
  });

  it('should render the section label', () => {
    const label = fixture.nativeElement.querySelector('.retro-section-header__label');
    expect(label?.textContent?.trim()).toBe('OPINION');
  });

  it('should render the ">" prefix', () => {
    const prefix = fixture.nativeElement.querySelector('.retro-section-header__prefix');
    expect(prefix).toBeTruthy();
  });

  it('should render count when provided', () => {
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();
    const count = fixture.nativeElement.querySelector('.retro-section-header__count');
    expect(count?.textContent?.trim()).toBe('[5]');
  });

  it('should not render count element when count is null', () => {
    expect(fixture.nativeElement.querySelector('.retro-section-header__count')).toBeNull();
  });
});
