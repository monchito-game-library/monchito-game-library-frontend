import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, it, expect } from 'vitest';
import { LibRouterTabsComponent } from './lib-router-tabs.component';
import { LibRouterTabItemInterface } from '@/interfaces/lib-router-tab-item.interface';

const testItems: readonly LibRouterTabItemInterface[] = [
  { path: '/collection', label: 'tabOverview', icon: 'home', exact: true },
  { path: '/collection/games', label: 'tabGames', icon: 'sports_esports' }
];

describe('LibRouterTabsComponent', () => {
  let fixture: ComponentFixture<LibRouterTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LibRouterTabsComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { tabOverview: 'Overview', tabGames: 'Games' } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LibRouterTabsComponent);
    fixture.componentRef.setInput('items', testItems);
    fixture.detectChanges();
  });

  it('should render a nav element', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).toBeTruthy();
  });

  it('should render correct number of links', () => {
    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(testItems.length);
  });

  it('should set aria-label on nav when provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'Colección');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Colección');
  });
});
