import { ApplicationConfig, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@ngneat/transloco';
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

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes),
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
    auditLogUseCasesProvider
  ]
};
