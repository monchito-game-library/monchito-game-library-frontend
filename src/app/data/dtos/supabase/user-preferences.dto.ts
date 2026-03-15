/** Row from the user_preferences table. */
export interface UserPreferencesDto {
  user_id: string;
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  avatar_url: string | null;
  banner_url?: string | null;
  role: string;
  created_at?: string;
  updated_at?: string;
}

/** Payload for inserting or updating a row in user_preferences. */
export type UserPreferencesInsertDto = Partial<UserPreferencesDto>;
