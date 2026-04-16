import { ApplicationConfig, isDevMode, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { authRepositoryProvider } from '@/di/repositories/auth.repository.provider';
import { rawgRepositoryProvider } from '@/di/repositories/rawg.repository.provider';
import { storeRepositoryProvider } from '@/di/repositories/store.repository.provider';
import { userPreferencesRepositoryProvider } from '@/di/repositories/user-preferences.repository.provider';
import { wishlistRepositoryProvider } from '@/di/repositories/wishlist.repository.provider';
import { authUseCasesProvider } from '@/di/use-cases/auth.use-cases.provider';
import { catalogUseCasesProvider } from '@/di/use-cases/catalog.use-cases.provider';
import { storeUseCasesProvider } from '@/di/use-cases/store.use-cases.provider';
import { userPreferencesUseCasesProvider } from '@/di/use-cases/user-preferences.use-cases.provider';
import { wishlistUseCasesProvider } from '@/di/use-cases/wishlist.use-cases.provider';
import { provideServiceWorker } from '@angular/service-worker';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    { provide: LOCALE_ID, useValue: 'es' },
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
    authRepositoryProvider,
    authUseCasesProvider,
    rawgRepositoryProvider,
    catalogUseCasesProvider,
    storeRepositoryProvider,
    storeUseCasesProvider,
    userPreferencesRepositoryProvider,
    userPreferencesUseCasesProvider,
    wishlistRepositoryProvider,
    wishlistUseCasesProvider,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately'
    })
  ]
};
