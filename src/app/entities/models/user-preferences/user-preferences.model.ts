/** Domain model for user preferences (theme, language and avatar). */
export interface UserPreferencesModel {
  userId: string;
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  avatarUrl?: string | null;
}
