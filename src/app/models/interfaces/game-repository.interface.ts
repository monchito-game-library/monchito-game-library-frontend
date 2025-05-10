import { GameInterface } from './game.interface';
import { GamesConsoleType } from '../types/games-console.type';

/**
 * Contrato para cualquier repositorio que gestione juegos persistidos por usuario.
 * Define operaciones CRUD sobre la colección de videojuegos por usuario.
 */
export interface GameRepositoryInterface {
  /**
   * Obtiene todos los juegos de un usuario específico.
   * @param userId ID del usuario
   */
  getAllGamesForUser(userId: string): Promise<GameInterface[]>;

  /**
   * Obtiene los juegos filtrados por consola para un usuario.
   * @param userId ID del usuario
   * @param console Consola por la que filtrar
   */
  getByConsole(userId: string, console: GamesConsoleType): Promise<GameInterface[]>;

  /**
   * Añade un nuevo juego para el usuario.
   * @param userId ID del usuario
   * @param game Juego a añadir
   */
  addGameForUser(userId: string, game: GameInterface): Promise<void>;

  /**
   * Elimina un juego por ID, solo si pertenece al usuario.
   * @param userId ID del usuario
   * @param id ID del juego
   */
  deleteById(userId: string, id: number): Promise<void>;

  /**
   * Actualiza un juego existente si pertenece al usuario.
   * @param userId ID del usuario
   * @param id ID del juego
   * @param game Datos actualizados
   */
  updateGameForUser(userId: string, id: number, game: GameInterface): Promise<void>;

  /**
   * Elimina todos los juegos de un usuario.
   * @param userId ID del usuario
   */
  clearAllForUser(userId: string): Promise<void>;

  /**
   * Obtiene un juego por ID si pertenece al usuario.
   * @param userId ID del usuario
   * @param id ID del juego
   */
  getById(userId: string, id: number): Promise<GameInterface | undefined>;
}
