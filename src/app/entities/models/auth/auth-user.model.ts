/**
 * Domain model for the authenticated user.
 * Provider-agnostic — does not depend on Supabase or any other auth implementation.
 */
export interface AuthUserModel {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}
