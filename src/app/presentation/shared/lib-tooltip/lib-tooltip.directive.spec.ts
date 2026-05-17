import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { LibTooltipDirective } from './lib-tooltip.directive';

@Component({
  template: `<button [libTooltip]="'Test tooltip'" [libTooltipDelay]="0">Hover me</button>`,
  standalone: true,
  imports: [LibTooltipDirective]
})
class TestHostComponent {}

describe('LibTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create the host', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show tooltip panel on mouseenter', async () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    // Delay is 0ms so tooltip should appear asynchronously
    await new Promise((r) => setTimeout(r, 10));
    const tooltip = document.querySelector('.lib-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent).toBe('Test tooltip');
    expect(tooltip?.getAttribute('role')).toBe('tooltip');
  });

  it('should remove tooltip panel on mouseleave', async () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    const tooltip = document.querySelector('.lib-tooltip');
    expect(tooltip).toBeNull();
  });

  it('should add aria-describedby to host when shown', async () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(btn.hasAttribute('aria-describedby')).toBe(true);
  });
});
