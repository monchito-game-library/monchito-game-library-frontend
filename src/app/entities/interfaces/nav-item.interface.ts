export interface NavItemInterface {
  icon: string;
  label: string;
  route: string;
  /** If true, hidden on mobile (< 767px) — only shown on tablet and above. */
  tabletOnly?: boolean;
}
