import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RetroListComponent } from './retro-list.component';

describe('RetroListComponent', () => {
  let fixture: ComponentFixture<RetroListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroListComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should use flex column layout', () => {
    const host: HTMLElement = fixture.nativeElement;
    const style = getComputedStyle(host);
    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('column');
  });
});

describe('RetroListComponent — projection', () => {
  @Component({
    template: `<retro-list><span class="child">Item</span></retro-list>`,
    imports: [RetroListComponent],
    standalone: true
  })
  class TestHostComponent {}

  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should project child content', () => {
    const child = hostFixture.nativeElement.querySelector('.child');
    expect(child).toBeTruthy();
    expect(child.textContent).toContain('Item');
  });
});
