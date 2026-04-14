import { describe, expect, it } from 'vitest';

import { HardwareEditionDto } from '@/dtos/supabase/hardware-edition.dto';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { mapHardwareEdition, mapHardwareEditionToInsertDto } from '@/mappers/supabase/hardware-edition.mapper';

const baseDto: HardwareEditionDto = {
  id: 'edition-1',
  model_id: 'model-1',
  name: 'Final Fantasy XVI Limited Edition'
};

const baseModel: Omit<HardwareEditionModel, 'id'> = {
  modelId: 'model-1',
  name: 'Final Fantasy XVI Limited Edition'
};

describe('mapHardwareEdition', () => {
  it('mapea todos los campos correctamente', () => {
    expect(mapHardwareEdition(baseDto)).toEqual({
      id: 'edition-1',
      modelId: 'model-1',
      name: 'Final Fantasy XVI Limited Edition'
    });
  });

  it('no incluye campos de timestamps en el modelo resultante', () => {
    const dto: HardwareEditionDto = { ...baseDto, created_at: '2024-01-01', updated_at: '2024-01-02' };
    const result = mapHardwareEdition(dto);

    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
  });
});

describe('mapHardwareEditionToInsertDto', () => {
  it('mapea el modelo al DTO de inserción correctamente', () => {
    expect(mapHardwareEditionToInsertDto(baseModel)).toEqual({
      model_id: 'model-1',
      name: 'Final Fantasy XVI Limited Edition'
    });
  });
});
