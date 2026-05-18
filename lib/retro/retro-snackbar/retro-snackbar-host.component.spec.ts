import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { RetroSnackbarHostComponent } from './retro-snackbar-host.component';
import { RetroSnackbarService } from './services/retro-snackbar.service';
import { mockRetroSnackbar } from '@/testing/retro-snackbar.mock';

describe('RetroSnackbarHostComponent', () => {
  let fixture: ComponentFixture<RetroSnackbarHostComponent>;
  let component: RetroSnackbarHostComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        RetroSnackbarHostComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { 'common.notifications': 'Notifications', 'common.close': 'Close' } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [{ provide: RetroSnackbarService, useValue: mockRetroSnackbar }]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroSnackbarHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
