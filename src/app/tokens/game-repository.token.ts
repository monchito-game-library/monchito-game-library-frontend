import { InjectionToken } from '@angular/core';
import { GameRepositoryInterface } from '../models/interfaces/game-repository.interface';

/**
 * Token de inyección para el repositorio de juegos.
 * Permite cambiar fácilmente entre diferentes implementaciones (IndexedDB, Supabase, etc.)
 */
export const GAME_REPOSITORY = new InjectionToken<GameRepositoryInterface>('GAME_REPOSITORY', {
  providedIn: 'root',
  factory: () => {
    throw new Error('GAME_REPOSITORY must be provided in app.config.ts');
  }
});
