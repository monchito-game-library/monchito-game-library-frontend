import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import {
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepositoryContract
} from '@/domain/repositories/user-preferences.repository.contract';
import { UserPreferencesUseCasesImpl } from './user-preferences.use-cases';

const mockRepo: UserPreferencesRepositoryContract = {
  getPreferences: vi.fn(),
  savePreferences: vi.fn(),
  saveAvatarUrl: vi.fn(),
  saveBannerUrl: vi.fn(),
  uploadAvatar: vi.fn(),
  uploadBanner: vi.fn(),
  deleteBanner: vi.fn()
};

function makeFile(size: number, type: string): File {
  return { size, type, name: 'test.jpg' } as File;
}

describe('UserPreferencesUseCasesImpl', () => {
  let useCases: UserPreferencesUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [UserPreferencesUseCasesImpl, { provide: USER_PREFERENCES_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(UserPreferencesUseCasesImpl);
  });

  describe('loadPreferences', () => {
    it('delega en repo.getPreferences', async () => {
      vi.mocked(mockRepo.getPreferences).mockResolvedValue(null);
      await useCases.loadPreferences('user-1');

      expect(mockRepo.getPreferences).toHaveBeenCalledWith('user-1');
    });
  });

  describe('savePreferences', () => {
    it('llama a repo.savePreferences con el modelo correcto', async () => {
      vi.mocked(mockRepo.savePreferences).mockResolvedValue();
      await useCases.savePreferences('user-1', 'dark', 'es');

      expect(mockRepo.savePreferences).toHaveBeenCalledWith({
        userId: 'user-1',
        theme: 'dark',
        language: 'es',
        role: 'member'
      });
    });
  });

  describe('uploadAvatar', () => {
    it('lanza error si el fichero supera 2 MB', async () => {
      const file = makeFile(3 * 1024 * 1024, 'image/jpeg');

      await expect(useCases.uploadAvatar('user-1', file)).rejects.toThrow('Image must not exceed 2 MB');
      expect(mockRepo.uploadAvatar).not.toHaveBeenCalled();
    });

    it('lanza error si el tipo MIME no está permitido', async () => {
      const file = makeFile(500 * 1024, 'image/gif');

      await expect(useCases.uploadAvatar('user-1', file)).rejects.toThrow('Unsupported format. Use JPG, PNG or WebP');
      expect(mockRepo.uploadAvatar).not.toHaveBeenCalled();
    });

    it('sube y guarda la URL cuando el fichero es válido', async () => {
      const file = makeFile(500 * 1024, 'image/jpeg');
      vi.mocked(mockRepo.uploadAvatar).mockResolvedValue('https://cdn.example.com/avatar.jpg');
      vi.mocked(mockRepo.saveAvatarUrl).mockResolvedValue();

      const url = await useCases.uploadAvatar('user-1', file);

      expect(url).toBe('https://cdn.example.com/avatar.jpg');
      expect(mockRepo.uploadAvatar).toHaveBeenCalledWith('user-1', file);
      expect(mockRepo.saveAvatarUrl).toHaveBeenCalledWith('user-1', 'https://cdn.example.com/avatar.jpg');
    });

    it('acepta imagen WebP', async () => {
      const file = makeFile(100 * 1024, 'image/webp');
      vi.mocked(mockRepo.uploadAvatar).mockResolvedValue('https://cdn.example.com/avatar.webp');
      vi.mocked(mockRepo.saveAvatarUrl).mockResolvedValue();

      await expect(useCases.uploadAvatar('user-1', file)).resolves.toBeDefined();
    });
  });

  describe('uploadBanner', () => {
    it('lanza error si el fichero supera 5 MB', async () => {
      const file = makeFile(6 * 1024 * 1024, 'image/png');

      await expect(useCases.uploadBanner('user-1', file)).rejects.toThrow('Image must not exceed 5 MB');
    });

    it('lanza error si el tipo MIME no está permitido', async () => {
      const file = makeFile(1 * 1024 * 1024, 'image/bmp');

      await expect(useCases.uploadBanner('user-1', file)).rejects.toThrow('Unsupported format. Use JPG, PNG or WebP');
    });

    it('sube y guarda la URL del banner cuando el fichero es válido', async () => {
      const file = makeFile(2 * 1024 * 1024, 'image/png');
      vi.mocked(mockRepo.uploadBanner).mockResolvedValue('https://cdn.example.com/banner.png');
      vi.mocked(mockRepo.saveBannerUrl).mockResolvedValue();

      const url = await useCases.uploadBanner('user-1', file);

      expect(url).toBe('https://cdn.example.com/banner.png');
      expect(mockRepo.saveBannerUrl).toHaveBeenCalledWith('user-1', 'https://cdn.example.com/banner.png');
    });
  });

  describe('saveBannerUrl', () => {
    it('guarda la URL sin borrar si el banner actual no es del bucket de banners', async () => {
      vi.mocked(mockRepo.saveBannerUrl).mockResolvedValue();
      const rawgUrl = 'https://media.rawg.io/media/games/foo/bar.jpg';

      await useCases.saveBannerUrl('user-1', 'https://new.com/banner.jpg', rawgUrl);

      expect(mockRepo.deleteBanner).not.toHaveBeenCalled();
      expect(mockRepo.saveBannerUrl).toHaveBeenCalledWith('user-1', 'https://new.com/banner.jpg');
    });

    it('borra el banner anterior y guarda el nuevo si el actual es del bucket de banners', async () => {
      vi.mocked(mockRepo.deleteBanner).mockResolvedValue();
      vi.mocked(mockRepo.saveBannerUrl).mockResolvedValue();
      const storageBannerUrl = 'https://supabase.co/storage/v1/object/public/banners/user-1/banner.jpg';

      await useCases.saveBannerUrl('user-1', 'https://new.com/banner.jpg', storageBannerUrl);

      expect(mockRepo.deleteBanner).toHaveBeenCalledWith('user-1');
      expect(mockRepo.saveBannerUrl).toHaveBeenCalledWith('user-1', 'https://new.com/banner.jpg');
    });

    it('continúa aunque falle el borrado del banner anterior', async () => {
      vi.mocked(mockRepo.deleteBanner).mockRejectedValue(new Error('delete failed'));
      vi.mocked(mockRepo.saveBannerUrl).mockResolvedValue();
      const storageBannerUrl = 'https://supabase.co/storage/v1/object/public/banners/user-1/banner.jpg';

      await expect(
        useCases.saveBannerUrl('user-1', 'https://new.com/banner.jpg', storageBannerUrl)
      ).resolves.toBeUndefined();

      expect(mockRepo.saveBannerUrl).toHaveBeenCalled();
    });

    it('acepta currentBannerUrl null sin intentar borrar', async () => {
      vi.mocked(mockRepo.saveBannerUrl).mockResolvedValue();

      await useCases.saveBannerUrl('user-1', 'https://new.com/banner.jpg', null);

      expect(mockRepo.deleteBanner).not.toHaveBeenCalled();
    });
  });
});
