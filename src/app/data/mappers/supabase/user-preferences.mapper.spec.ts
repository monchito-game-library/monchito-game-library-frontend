import { describe, expect, it } from 'vitest';

import { UserPreferencesDto } from '@/dtos/supabase/user-preferences.dto';
import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';
import { mapUserPreferences, mapUserPreferencesToInsertDto } from '@/mappers/supabase/user-preferences.mapper';

const baseDto: UserPreferencesDto = {
  user_id: 'user-uuid-1',
  theme: 'dark',
  language: 'es',
  avatar_url: 'https://example.com/avatar.jpg',
  banner_url: 'https://example.com/banner.jpg',
  role: 'admin'
};

describe('mapUserPreferences', () => {
  it('mapea todos los campos correctamente', () => {
    const result = mapUserPreferences(baseDto, 'user-uuid-1');

    expect(result.userId).toBe('user-uuid-1');
    expect(result.theme).toBe('dark');
    expect(result.language).toBe('es');
    expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(result.bannerUrl).toBe('https://example.com/banner.jpg');
    expect(result.role).toBe('admin');
  });

  it('usa el userId pasado como parámetro, no el del DTO', () => {
    const result = mapUserPreferences(baseDto, 'override-id');
    expect(result.userId).toBe('override-id');
  });

  it('mapea avatar_url null a null', () => {
    expect(mapUserPreferences({ ...baseDto, avatar_url: null }, 'u').avatarUrl).toBeNull();
  });

  it('mapea banner_url null a null', () => {
    expect(mapUserPreferences({ ...baseDto, banner_url: null }, 'u').bannerUrl).toBeNull();
  });

  it('asigna role member por defecto cuando role es null', () => {
    const result = mapUserPreferences({ ...baseDto, role: null as unknown as string }, 'u');
    expect(result.role).toBe('member');
  });
});

describe('mapUserPreferencesToInsertDto', () => {
  const model: UserPreferencesModel = {
    userId: 'user-uuid-1',
    theme: 'light',
    language: 'en',
    avatarUrl: 'https://example.com/avatar.jpg',
    bannerUrl: null,
    role: 'member'
  };

  it('mapea los campos básicos al DTO', () => {
    const result = mapUserPreferencesToInsertDto(model);

    expect(result.user_id).toBe('user-uuid-1');
    expect(result.theme).toBe('light');
    expect(result.language).toBe('en');
  });

  it('incluye avatar_url cuando avatarUrl no es undefined', () => {
    const result = mapUserPreferencesToInsertDto(model);
    expect(result.avatar_url).toBe('https://example.com/avatar.jpg');
  });

  it('no incluye avatar_url cuando avatarUrl es undefined', () => {
    const result = mapUserPreferencesToInsertDto({ ...model, avatarUrl: undefined as unknown as null });
    expect(result).not.toHaveProperty('avatar_url');
  });
});
