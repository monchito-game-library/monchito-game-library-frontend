import { describe, expect, it } from 'vitest';

import { StoreDto } from '@/dtos/supabase/store.dto';
import { StoreModel } from '@/models/store/store.model';
import { mapStore, mapStoreToInsertDto } from '@/mappers/supabase/store.mapper';

describe('mapStore', () => {
  it('mapea todos los campos correctamente', () => {
    const dto: StoreDto = {
      id: 'uuid-1',
      label: 'GAME',
      format_hint: 'physical',
      created_by: 'user-uuid'
    };

    expect(mapStore(dto)).toEqual({
      id: 'uuid-1',
      label: 'GAME',
      formatHint: 'physical'
    });
  });

  it('mapea format_hint digital correctamente', () => {
    const dto: StoreDto = {
      id: 'uuid-2',
      label: 'PSN Store',
      format_hint: 'digital',
      created_by: null
    };

    expect(mapStore(dto).formatHint).toBe('digital');
  });

  it('mapea format_hint null a null', () => {
    const dto: StoreDto = {
      id: 'uuid-3',
      label: 'Mixta',
      format_hint: null,
      created_by: null
    };

    expect(mapStore(dto).formatHint).toBeNull();
  });

  it('no incluye created_by en el modelo resultante', () => {
    const dto: StoreDto = {
      id: 'uuid-4',
      label: 'Amazon',
      format_hint: null,
      created_by: 'user-uuid'
    };

    expect(mapStore(dto)).not.toHaveProperty('created_by');
  });
});

describe('mapStoreToInsertDto', () => {
  it('mapea el modelo al DTO de inserción correctamente', () => {
    const model: Omit<StoreModel, 'id'> = {
      label: 'Amazon',
      formatHint: 'digital'
    };

    expect(mapStoreToInsertDto(model, 'user-1')).toEqual({
      label: 'Amazon',
      format_hint: 'digital',
      created_by: 'user-1'
    });
  });

  it('mapea formatHint null a format_hint null', () => {
    const model: Omit<StoreModel, 'id'> = {
      label: 'Mixta',
      formatHint: null
    };

    expect(mapStoreToInsertDto(model, 'user-2').format_hint).toBeNull();
  });

  it('incluye el createdBy como created_by', () => {
    const model: Omit<StoreModel, 'id'> = { label: 'Test', formatHint: null };
    const dto = mapStoreToInsertDto(model, 'owner-uuid');

    expect(dto.created_by).toBe('owner-uuid');
  });
});
