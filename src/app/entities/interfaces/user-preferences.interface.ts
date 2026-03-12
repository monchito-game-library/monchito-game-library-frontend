export interface UserPreferencesInterface {
  userId: string;
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  avatarUrl?: string | null;
}
