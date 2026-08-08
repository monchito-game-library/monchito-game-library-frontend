/** Route-param placeholders for create/edit flows. These are never valid row UUIDs and must not be sent to Supabase as id filters. */
export const ROUTE_PLACEHOLDER_IDS: readonly string[] = ['new', 'add'] as const;
