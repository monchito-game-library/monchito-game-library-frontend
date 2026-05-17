import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RetroMenuItemComponent } from './retro-menu-item.component';

describe('RetroMenuItemComponent', () => {
  let fixture: ComponentFixture<RetroMenuItemComponent>;
  let component: RetroMenuItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroMenuItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render with role="none" on li and role="menuitem" on button', () => {
    const li = fixture.nativeElement.querySelector('li');
    const btn = fixture.nativeElement.querySelector('button');
    expect(li?.getAttribute('role')).toBe('none');
    expect(btn?.getAttribute('role')).toBe('menuitem');
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.disabled).toBeTruthy();
  });

  it('should emit clicked when button is clicked and not disabled', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
  });

  it('should NOT emit clicked when onClick is called while disabled', () => {
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.clicked.subscribe(spy);
    component.onClick(new MouseEvent('click'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render icon when icon input is provided', () => {
    fixture.componentRef.setInput('icon', 'delete');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('retro-icon');
    expect(icon).toBeTruthy();
  });
});
