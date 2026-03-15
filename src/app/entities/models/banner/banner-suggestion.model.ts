/** Minimal model used by the settings banner picker. Only the fields it actually needs. */
export interface BannerSuggestionModel {
  /** Cover image URL used as the banner background. */
  imageUrl: string;
  /** Game title — used as alt text on the thumbnail. */
  title: string;
}
