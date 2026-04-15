import { describe, expect, it } from 'vitest';

import { HardwareBrandDto } from '@/dtos/supabase/hardware-brand.dto';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { mapHardwareBrand, mapHardwareBrandToInsertDto } from '@/mappers/supabase/hardware-brand.mapper';

const baseDto: HardwareBrandDto = {
  id: 'brand-1',
  name: 'Sony'
};

const baseModel: Omit<HardwareBrandModel, 'id'> = {
  name: 'Sony'
};

describe('mapHardwareBrand', () => {
  it('mapea todos los campos correctamente', () => {
    expect(mapHardwareBrand(baseDto)).toEqual({
      id: 'brand-1',
      name: 'Sony'
    });
  });

  it('no incluye campos de timestamps en el modelo resultante', () => {
    const dto: HardwareBrandDto = { ...baseDto, created_at: '2024-01-01', updated_at: '2024-01-02' };
    const result = mapHardwareBrand(dto);

    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
  });
});

describe('mapHardwareBrandToInsertDto', () => {
  it('mapea el modelo al DTO de inserción correctamente', () => {
    expect(mapHardwareBrandToInsertDto(baseModel)).toEqual({
      name: 'Sony'
    });
  });
});
