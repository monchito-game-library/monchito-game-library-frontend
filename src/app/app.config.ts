import { ApplicationConfig, isDevMode, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { gameRepositoryProvider } from '@/di/repositories/game.repository.provider';
import { userPreferencesRepositoryProvider } from '@/di/repositories/user-preferences.repository.provider';
import { authRepositoryProvider } from '@/di/repositories/auth.repository.provider';
import { rawgRepositoryProvider } from '@/di/repositories/rawg.repository.provider';
import { gameUseCasesProvider } from '@/di/use-cases/game.use-cases.provider';
import { userPreferencesUseCasesProvider } from '@/di/use-cases/user-preferences.use-cases.provider';
import { authUseCasesProvider } from '@/di/use-cases/auth.use-cases.provider';
import { catalogUseCasesProvider } from '@/di/use-cases/catalog.use-cases.provider';
import { storeRepositoryProvider } from '@/di/repositories/store.repository.provider';
import { storeUseCasesProvider } from '@/di/use-cases/store.use-cases.provider';
import { userAdminRepositoryProvider } from '@/di/repositories/user-admin.repository.provider';
import { userAdminUseCasesProvider } from '@/di/use-cases/user-admin.use-cases.provider';
import { auditLogRepositoryProvider } from '@/di/repositories/audit-log.repository.provider';
import { auditLogUseCasesProvider } from '@/di/use-cases/audit-log.use-cases.provider';
import { wishlistRepositoryProvider } from '@/di/repositories/wishlist.repository.provider';
import { wishlistUseCasesProvider } from '@/di/use-cases/wishlist.use-cases.provider';
import { protectorRepositoryProvider } from '@/di/repositories/protector.repository.provider';
import { protectorUseCasesProvider } from '@/di/use-cases/protector.use-cases.provider';
import { orderRepositoryProvider } from '@/di/repositories/order.repository.provider';
import { ordersUseCasesProvider } from '@/di/use-cases/orders.use-cases.provider';
import { provideServiceWorker } from '@angular/service-worker';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    { provide: LOCALE_ID, useValue: 'es' },
    provideAnimationsAsync(),
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
    gameRepositoryProvider,
    userPreferencesRepositoryProvider,
    authRepositoryProvider,
    rawgRepositoryProvider,
    gameUseCasesProvider,
    userPreferencesUseCasesProvider,
    authUseCasesProvider,
    catalogUseCasesProvider,
    storeRepositoryProvider,
    storeUseCasesProvider,
    userAdminRepositoryProvider,
    userAdminUseCasesProvider,
    auditLogRepositoryProvider,
    auditLogUseCasesProvider,
    wishlistRepositoryProvider,
    wishlistUseCasesProvider,
    protectorRepositoryProvider,
    protectorUseCasesProvider,
    orderRepositoryProvider,
    ordersUseCasesProvider,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately'
    })
  ]
};
