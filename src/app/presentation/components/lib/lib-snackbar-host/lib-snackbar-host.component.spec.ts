import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { LibSnackbarHostComponent } from './lib-snackbar-host.component';
import { LibSnackbarService } from '@/services/lib-snackbar/lib-snackbar.service';
import { mockLibSnackbar } from 'src/testing/lib-snackbar.mock';

describe('LibSnackbarHostComponent', () => {
  let fixture: ComponentFixture<LibSnackbarHostComponent>;
  let component: LibSnackbarHostComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        LibSnackbarHostComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { 'common.notifications': 'Notifications', 'common.close': 'Close' } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [{ provide: LibSnackbarService, useValue: mockLibSnackbar }]
    }).compileComponents();

    fixture = TestBed.createComponent(LibSnackbarHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
