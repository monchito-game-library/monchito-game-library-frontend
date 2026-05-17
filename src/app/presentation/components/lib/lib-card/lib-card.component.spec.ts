import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibCardComponent } from './lib-card.component';

describe('LibCardComponent', () => {
  let fixture: ComponentFixture<LibCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibCardComponent);
    fixture.detectChanges();
  });

  it('should render the card container', () => {
    expect(fixture.nativeElement.querySelector('.lib-card')).toBeTruthy();
  });

  it('should apply --padded modifier by default', () => {
    expect(fixture.nativeElement.querySelector('.lib-card--padded')).toBeTruthy();
  });

  it('should apply --accent modifier when variant is accent', () => {
    fixture.componentRef.setInput('variant', 'accent');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lib-card--accent')).toBeTruthy();
  });

  it('should add role=button when interactive is true', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.lib-card');
    expect(card?.getAttribute('role')).toBe('button');
  });

  it('should emit cardClicked when interactive card is clicked', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.cardClicked.subscribe((e: MouseEvent) => emitted.push(e));
    fixture.nativeElement.querySelector('.lib-card')?.click();
    expect(emitted.length).toBe(1);
  });
});
