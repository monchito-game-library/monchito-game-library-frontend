/** Row from the game_loans table. */
export interface GameLoanDto {
  id: string;
  user_game_id: string;
  loaned_to: string;
  /** ISO date string 'YYYY-MM-DD'. */
  loaned_at: string;
  /** NULL while the game is still on loan. */
  returned_at: string | null;
  created_at: string;
}

/** Payload for inserting a new loan row. */
export type GameLoanInsertDto = Pick<GameLoanDto, 'user_game_id' | 'loaned_to' | 'loaned_at'>;
