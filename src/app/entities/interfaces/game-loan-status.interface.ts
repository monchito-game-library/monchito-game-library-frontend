/** Data transferred when creating a new game loan. */
export interface GameLoanStatusModel {
  /** UUID of the user_games row being loaned. */
  userGameId: string;
  /** Name of the person borrowing the game (free text). */
  loanedTo: string;
  /** Loan date (ISO string 'YYYY-MM-DD'). */
  loanedAt: string;
}
