import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroCardComponent } from './retro-card.component';

describe('RetroCardComponent', () => {
  let fixture: ComponentFixture<RetroCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroCardComponent);
    fixture.detectChanges();
  });

  it('should render the card container', () => {
    expect(fixture.nativeElement.querySelector('.retro-card')).toBeTruthy();
  });

  it('should apply --padded modifier by default', () => {
    expect(fixture.nativeElement.querySelector('.retro-card--padded')).toBeTruthy();
  });

  it('should apply --accent modifier when variant is accent', () => {
    fixture.componentRef.setInput('variant', 'accent');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.retro-card--accent')).toBeTruthy();
  });

  it('should add role=button when interactive is true', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.retro-card');
    expect(card?.getAttribute('role')).toBe('button');
  });

  it('should emit cardClicked when interactive card is clicked', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
    fixture.nativeElement.querySelector('.retro-card')?.click();
    expect(emitted.length).toBe(1);
  });
});
