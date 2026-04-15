import { describe, expect, it } from 'vitest';

import { HardwareModelDto } from '@/dtos/supabase/hardware-model.dto';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { mapHardwareModel, mapHardwareModelToInsertDto } from '@/mappers/supabase/hardware-model.mapper';

const baseDto: HardwareModelDto = {
  id: 'model-1',
  brand_id: 'brand-1',
  name: 'PlayStation 5',
  type: 'console',
  generation: 9
};

const baseModel: Omit<HardwareModelModel, 'id'> = {
  brandId: 'brand-1',
  name: 'PlayStation 5',
  type: 'console',
  generation: 9
};

describe('mapHardwareModel', () => {
  it('mapea todos los campos correctamente', () => {
    expect(mapHardwareModel(baseDto)).toEqual({
      id: 'model-1',
      brandId: 'brand-1',
      name: 'PlayStation 5',
      type: 'console',
      generation: 9
    });
  });

  it('mapea generation null correctamente', () => {
    const dto: HardwareModelDto = { ...baseDto, generation: null };
    expect(mapHardwareModel(dto).generation).toBeNull();
  });

  it('mapea type controller correctamente', () => {
    const dto: HardwareModelDto = { ...baseDto, type: 'controller' };
    expect(mapHardwareModel(dto).type).toBe('controller');
  });

  it('no incluye campos de timestamps en el modelo resultante', () => {
    const dto: HardwareModelDto = { ...baseDto, created_at: '2024-01-01', updated_at: '2024-01-02' };
    const result = mapHardwareModel(dto);

    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
  });
});

describe('mapHardwareModelToInsertDto', () => {
  it('mapea el modelo al DTO de inserción correctamente', () => {
    expect(mapHardwareModelToInsertDto(baseModel)).toEqual({
      brand_id: 'brand-1',
      name: 'PlayStation 5',
      type: 'console',
      generation: 9
    });
  });

  it('mapea generation null correctamente', () => {
    const model: Omit<HardwareModelModel, 'id'> = { ...baseModel, generation: null };
    expect(mapHardwareModelToInsertDto(model).generation).toBeNull();
  });

  it('mapea type controller correctamente', () => {
    const model: Omit<HardwareModelModel, 'id'> = { ...baseModel, type: 'controller' };
    expect(mapHardwareModelToInsertDto(model).type).toBe('controller');
  });
});
