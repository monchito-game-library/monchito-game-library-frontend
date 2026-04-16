/** Minimal shape required by HardwareListShellComponent to render a hardware item card. */
export interface HardwareListItem {
  id: string;
  modelId: string | null;
  brandId: string | null;
  price: number | null;
  purchaseDate: string | null;
  store: string | null;
}
