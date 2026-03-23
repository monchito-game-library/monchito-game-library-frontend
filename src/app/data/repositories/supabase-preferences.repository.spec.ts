import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase, mockStorageBucket } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabasePreferencesRepository } from './supabase-preferences.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order', 'range', 'limit', 'insert', 'update', 'delete', 'upsert', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const preferencesDto = {
  theme: 'dark',
  language: 'es',
  avatar_url: null,
  banner_url: null,
  role: 'user'
};

describe('SupabasePreferencesRepository', () => {
  let repo: SupabasePreferencesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.storage.from.mockReturnValue(mockStorageBucket);
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabasePreferencesRepository]
    });
    repo = TestBed.inject(SupabasePreferencesRepository);
  });

  describe('getPreferences', () => {
    it('devuelve las preferencias mapeadas cuando existen', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: preferencesDto, error: null }));

      const result = await repo.getPreferences('user-1');

      expect(result).not.toBeNull();
      expect(result!.theme).toBe('dark');
      expect(result!.language).toBe('es');
    });

    it('devuelve null cuando no hay preferencias o Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'No rows' } }));

      const result = await repo.getPreferences('user-1');

      expect(result).toBeNull();
    });
  });

  describe('savePreferences', () => {
    it('llama a upsert con el payload correcto', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.savePreferences({ userId: 'user-1', theme: 'dark', language: 'es', role: 'user' });

      expect(b.upsert).toHaveBeenCalled();
    });

    it('lanza error si upsert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Upsert failed' } }));

      await expect(
        repo.savePreferences({ userId: 'user-1', theme: 'light', language: 'en', role: 'user' })
      ).rejects.toThrow('Failed to save preferences');
    });
  });

  describe('saveAvatarUrl', () => {
    it('llama a upsert con user_id y avatar_url', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.saveAvatarUrl('user-1', 'https://cdn.example.com/avatar.jpg');

      expect(b.upsert).toHaveBeenCalledWith({
        user_id: 'user-1',
        avatar_url: 'https://cdn.example.com/avatar.jpg'
      });
    });

    it('lanza error si upsert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Upsert failed' } }));

      await expect(repo.saveAvatarUrl('user-1', 'https://cdn.example.com/avatar.jpg')).rejects.toThrow(
        'Failed to save avatar URL'
      );
    });
  });

  describe('saveBannerUrl', () => {
    it('llama a upsert con user_id y banner_url', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.saveBannerUrl('user-1', 'https://cdn.example.com/banner.jpg');

      expect(b.upsert).toHaveBeenCalledWith({
        user_id: 'user-1',
        banner_url: 'https://cdn.example.com/banner.jpg'
      });
    });

    it('lanza error si upsert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Upsert failed' } }));

      await expect(repo.saveBannerUrl('user-1', 'https://cdn.example.com/banner.jpg')).rejects.toThrow(
        'Failed to save banner URL'
      );
    });
  });

  describe('uploadAvatar', () => {
    it('sube el fichero y devuelve la URL pública con timestamp', async () => {
      mockStorageBucket.upload.mockResolvedValue({ error: null });
      mockStorageBucket.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/avatars/user-1' } });

      const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });
      const url = await repo.uploadAvatar('user-1', file);

      expect(mockStorageBucket.upload).toHaveBeenCalledWith('user-1', file, expect.objectContaining({ upsert: true }));
      expect(url).toContain('https://cdn.example.com/avatars/user-1');
      expect(url).toContain('?t=');
    });

    it('lanza error si la subida falla', async () => {
      mockStorageBucket.upload.mockResolvedValue({ error: { message: 'Storage full' } });

      const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });
      await expect(repo.uploadAvatar('user-1', file)).rejects.toThrow('Failed to upload avatar');
    });
  });

  describe('uploadBanner', () => {
    it('sube el banner y devuelve la URL pública con timestamp', async () => {
      mockStorageBucket.upload.mockResolvedValue({ error: null });
      mockStorageBucket.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://cdn.example.com/banners/user-1' }
      });

      const file = new File(['data'], 'banner.jpg', { type: 'image/jpeg' });
      const url = await repo.uploadBanner('user-1', file);

      expect(mockStorageBucket.upload).toHaveBeenCalledWith('user-1', file, expect.objectContaining({ upsert: true }));
      expect(url).toContain('https://cdn.example.com/banners/user-1');
      expect(url).toContain('?t=');
    });

    it('lanza error si la subida del banner falla', async () => {
      mockStorageBucket.upload.mockResolvedValue({ error: { message: 'Storage full' } });

      const file = new File(['data'], 'banner.jpg', { type: 'image/jpeg' });
      await expect(repo.uploadBanner('user-1', file)).rejects.toThrow('Failed to upload banner');
    });
  });

  describe('deleteBanner', () => {
    it('llama a remove con el userId como path', async () => {
      mockStorageBucket.remove.mockResolvedValue({ error: null });

      await repo.deleteBanner('user-1');

      expect(mockStorageBucket.remove).toHaveBeenCalledWith(['user-1']);
    });
  });
});
