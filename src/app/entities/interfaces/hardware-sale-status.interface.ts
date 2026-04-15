/** Payload used to update the sale status of a console or controller. */
export interface HardwareSaleStatusModel {
  forSale: boolean;
  salePrice: number | null;
  soldAt: string | null;
  soldPriceFinal: number | null;
}
