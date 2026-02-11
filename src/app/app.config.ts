import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@ngneat/transloco';
import { GAME_REPOSITORY } from './tokens/game-repository.token';
import { SupabaseRepository } from './repositories/supabase.repository';
// import { IndexedDBRepository } from './repositories/indexeddb.repository'; // Descomenta para usar IndexedDB

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
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
    // Configuración del repositorio de juegos
    // Cambia entre SupabaseRepository e IndexedDBRepository según necesites
    {
      provide: GAME_REPOSITORY,
      useClass: SupabaseRepository // Cambia a IndexedDBRepository para usar base de datos local
    }
  ]
};
