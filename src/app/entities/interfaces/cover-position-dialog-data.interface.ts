/** Data passed to the GameCoverPositionDialogComponent via MAT_DIALOG_DATA. */
export interface CoverPositionDialogDataInterface {
  /** URL of the cover image to reposition. */
  imageUrl: string;
  /** Dialog title. */
  title: string;
  /** Current CSS object-position value (e.g. "50% 30%"), or null for default center. */
  initialPosition: string | null;
}
