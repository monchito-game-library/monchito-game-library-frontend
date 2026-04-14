import { describe, expect, it } from 'vitest';

import { HardwareConsoleSpecsDto } from '@/dtos/supabase/hardware-console-specs.dto';
import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import {
  mapHardwareConsoleSpecs,
  mapHardwareConsoleSpecsToUpsertDto
} from '@/mappers/supabase/hardware-console-specs.mapper';

const baseDto: HardwareConsoleSpecsDto = {
  model_id: 'model-1',
  launch_year: 2020,
  discontinued_year: null,
  category: 'home',
  media: 'optical_disc',
  video_resolution: '4K',
  units_sold_million: 67
};

const baseModel: HardwareConsoleSpecsModel = {
  modelId: 'model-1',
  launchYear: 2020,
  discontinuedYear: null,
  category: 'home',
  media: 'optical_disc',
  videoResolution: '4K',
  unitsSoldMillion: 67
};

describe('mapHardwareConsoleSpecs', () => {
  it('mapea todos los campos correctamente', () => {
    expect(mapHardwareConsoleSpecs(baseDto)).toEqual(baseModel);
  });

  it('mapea discontinued_year null correctamente', () => {
    expect(mapHardwareConsoleSpecs(baseDto).discontinuedYear).toBeNull();
  });

  it('mapea discontinued_year con valor', () => {
    const dto: HardwareConsoleSpecsDto = { ...baseDto, discontinued_year: 2022 };
    expect(mapHardwareConsoleSpecs(dto).discontinuedYear).toBe(2022);
  });

  it('mapea video_resolution null correctamente', () => {
    const dto: HardwareConsoleSpecsDto = { ...baseDto, video_resolution: null };
    expect(mapHardwareConsoleSpecs(dto).videoResolution).toBeNull();
  });

  it('mapea units_sold_million null correctamente', () => {
    const dto: HardwareConsoleSpecsDto = { ...baseDto, units_sold_million: null };
    expect(mapHardwareConsoleSpecs(dto).unitsSoldMillion).toBeNull();
  });

  it('mapea category portable correctamente', () => {
    const dto: HardwareConsoleSpecsDto = { ...baseDto, category: 'portable' };
    expect(mapHardwareConsoleSpecs(dto).category).toBe('portable');
  });

  it('mapea media built_in correctamente', () => {
    const dto: HardwareConsoleSpecsDto = { ...baseDto, media: 'built_in' };
    expect(mapHardwareConsoleSpecs(dto).media).toBe('built_in');
  });
});

describe('mapHardwareConsoleSpecsToUpsertDto', () => {
  it('mapea el modelo al DTO de upsert correctamente', () => {
    expect(mapHardwareConsoleSpecsToUpsertDto(baseModel)).toEqual(baseDto);
  });

  it('preserva discontinued_year null', () => {
    expect(mapHardwareConsoleSpecsToUpsertDto(baseModel).discontinued_year).toBeNull();
  });

  it('preserva units_sold_million null', () => {
    const model: HardwareConsoleSpecsModel = { ...baseModel, unitsSoldMillion: null };
    expect(mapHardwareConsoleSpecsToUpsertDto(model).units_sold_million).toBeNull();
  });
});
