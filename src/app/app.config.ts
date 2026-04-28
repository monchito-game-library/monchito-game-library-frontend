import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  LOCALE_ID,
  provideZonelessChangeDetection
} from '@angular/core';
import { IMAGE_LOADER, ImageLoaderConfig, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter, Router, withInMemoryScrolling } from '@angular/router';
import * as Sentry from '@sentry/angular';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { authRepositoryProvider } from '@/di/repositories/auth.repository.provider';
import { userPreferencesRepositoryProvider } from '@/di/repositories/user-preferences.repository.provider';
import { authUseCasesProvider } from '@/di/use-cases/auth.use-cases.provider';
import { userPreferencesUseCasesProvider } from '@/di/use-cases/user-preferences.use-cases.provider';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '@/env';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    }),
    { provide: IMAGE_LOADER, useValue: (config: ImageLoaderConfig) => config.src },
    authRepositoryProvider,
    authUseCasesProvider,
    userPreferencesRepositoryProvider,
    userPreferencesUseCasesProvider,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately'
    }),
    ...(environment.sentry.enabled
      ? [
          { provide: ErrorHandler, useValue: Sentry.createErrorHandler() },
          { provide: Sentry.TraceService, deps: [Router] },
          { provide: APP_INITIALIZER, useFactory: () => () => {}, deps: [Sentry.TraceService], multi: true }
        ]
      : [])
  ]
};
