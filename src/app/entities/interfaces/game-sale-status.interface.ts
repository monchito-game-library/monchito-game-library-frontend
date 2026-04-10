/** Data transferred when updating the sale status of a game. */
export interface GameSaleStatusModel {
  /** Whether the game is listed as available for sale. */
  forSale: boolean;
  /** Desired sale price. Null when not for sale. */
  salePrice: number | null;
  /** Date the game was actually sold. Null while still in the active collection. */
  soldAt: string | null;
  /** Final price obtained when sold. Null while not yet sold. */
  soldPriceFinal: number | null;
}
