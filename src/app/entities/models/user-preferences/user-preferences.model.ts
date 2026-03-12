/** Domain model for user preferences (theme, language, avatar and banner). */
export interface UserPreferencesModel {
  userId: string;
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}
