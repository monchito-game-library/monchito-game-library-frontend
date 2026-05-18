import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { describe, beforeEach, it, expect } from 'vitest';
import { RetroMenuComponent } from './retro-menu.component';
import { RetroMenuItemComponent } from './components/retro-menu-item/retro-menu-item.component';
import { RetroMenuTriggerDirective } from './directive/retro-menu-trigger.directive';

@Component({
  selector: 'app-menu-host',
  standalone: true,
  imports: [RetroMenuComponent, RetroMenuItemComponent, RetroMenuTriggerDirective],
  template: `
    <button [retroMenuTriggerFor]="menu" aria-label="Abrir menú">Trigger</button>
    <retro-menu #menu>
      <retro-menu-item (clicked)="onItemA()">Opción A</retro-menu-item>
      <retro-menu-item (clicked)="onItemB()">Opción B</retro-menu-item>
      <retro-menu-item [isDisabled]="true">Deshabilitada</retro-menu-item>
    </retro-menu>
  `
})
class MenuHostComponent {
  itemAClicked = false;
  itemBClicked = false;

  /** Marca el item A como clicado. */
  onItemA(): void {
    this.itemAClicked = true;
  }

  /** Marca el item B como clicado. */
  onItemB(): void {
    this.itemBClicked = true;
  }
}

describe('RetroMenuComponent', () => {
  let fixture: ComponentFixture<MenuHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuHostComponent, OverlayModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuHostComponent);
    fixture.detectChanges();
  });

  it('should render trigger button', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
  });

  it('trigger should have aria-haspopup="menu"', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('trigger should have aria-expanded="false" when closed', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('retro-menu should not be visible in DOM before open', () => {
    const menu = document.querySelector('.retro-menu');
    expect(menu).toBeNull();
  });
});
