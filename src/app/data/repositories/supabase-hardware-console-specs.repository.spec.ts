import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { SupabaseHardwareConsoleSpecsRepository } from './supabase-hardware-console-specs.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'upsert', 'delete', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const specsDto = {
  model_id: 'model-1',
  launch_year: 2020,
  discontinued_year: null,
  category: 'home' as const,
  media: 'optical_disc' as const,
  video_resolution: '4K',
  units_sold_million: 67
};

describe('SupabaseHardwareConsoleSpecsRepository', () => {
  let repo: SupabaseHardwareConsoleSpecsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseHardwareConsoleSpecsRepository]
    });
    repo = TestBed.inject(SupabaseHardwareConsoleSpecsRepository);
  });

  describe('getByModelId', () => {
    it('devuelve las specs mapeadas cuando existen', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: specsDto, error: null }));

      const result = await repo.getByModelId('model-1');

      expect(result?.modelId).toBe('model-1');
      expect(result?.launchYear).toBe(2020);
      expect(result?.category).toBe('home');
    });

    it('devuelve undefined cuando no existen', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'not found' } }));

      const result = await repo.getByModelId('model-x');

      expect(result).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('hace upsert y devuelve las specs mapeadas', async () => {
      const b = makeBuilder({ data: specsDto, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.upsert({
        modelId: 'model-1',
        launchYear: 2020,
        discontinuedYear: null,
        category: 'home',
        media: 'optical_disc',
        videoResolution: '4K',
        unitsSoldMillion: 67
      });

      expect(b.upsert).toHaveBeenCalled();
      expect(result.modelId).toBe('model-1');
    });

    it('lanza error si el upsert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'upsert failed' } }));

      await expect(
        repo.upsert({
          modelId: 'model-1',
          launchYear: 2020,
          discontinuedYear: null,
          category: 'home',
          media: 'optical_disc',
          videoResolution: null,
          unitsSoldMillion: null
        })
      ).rejects.toThrow('Failed to upsert console specs');
    });
  });

  describe('delete', () => {
    it('llama a delete con el model_id correcto', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.delete('model-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('model_id', 'model-1');
    });

    it('lanza error si delete falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'delete failed' } }));

      await expect(repo.delete('model-1')).rejects.toThrow('Failed to delete console specs');
    });
  });
});
