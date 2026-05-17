import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { describe, beforeEach, it, expect } from 'vitest';
import { LibMenuComponent } from './lib-menu.component';
import { LibMenuItemComponent } from './lib-menu-item.component';
import { LibMenuTriggerDirective } from './lib-menu-trigger.directive';

@Component({
  selector: 'app-menu-host',
  standalone: true,
  imports: [LibMenuComponent, LibMenuItemComponent, LibMenuTriggerDirective],
  template: `
    <button [libMenuTriggerFor]="menu" aria-label="Abrir menú">Trigger</button>
    <app-lib-menu #menu>
      <app-lib-menu-item (clicked)="onItemA()">Opción A</app-lib-menu-item>
      <app-lib-menu-item (clicked)="onItemB()">Opción B</app-lib-menu-item>
      <app-lib-menu-item [isDisabled]="true">Deshabilitada</app-lib-menu-item>
    </app-lib-menu>
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

describe('LibMenuComponent', () => {
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

  it('lib-menu should not be visible in DOM before open', () => {
    const menu = document.querySelector('.lib-menu');
    expect(menu).toBeNull();
  });
});
