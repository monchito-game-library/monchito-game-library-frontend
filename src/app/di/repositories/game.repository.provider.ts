import { InjectionToken, Provider } from '@angular/core';
import { GameRepositoryInterface } from '@/domain/repositories/game.repository.contract';
import { SupabaseRepository } from '@/repositories/supabase.repository';

/**
 * Token de inyección para el repositorio de juegos.
 * Permite cambiar fácilmente entre diferentes implementaciones (IndexedDB, Supabase, etc.)
 */
export const GAME_REPOSITORY = new InjectionToken<GameRepositoryInterface>('GAME_REPOSITORY');

/**
 * Provider por defecto: usa Supabase como implementación.
 * Cambia a IndexedDBRepository para usar base de datos local.
 */
export const gameRepositoryProvider: Provider = {
  provide: GAME_REPOSITORY,
  useClass: SupabaseRepository
};
