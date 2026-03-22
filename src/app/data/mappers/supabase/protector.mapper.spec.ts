import { describe, expect, it } from 'vitest';

import { ProtectorDto } from '@/dtos/supabase/protector.dto';
import { ProtectorModel } from '@/models/protector/protector.model';
import { mapProtector, mapProtectorToInsertDto } from '@/mappers/supabase/protector.mapper';

const baseDto: ProtectorDto = {
  id: 'prot-uuid-1',
  name: 'Cajas tamaño BluRay',
  packs: [
    { quantity: 10, price: 8.99, url: 'https://example.com/pack10' },
    { quantity: 50, price: 34.99, url: null }
  ],
  category: 'box',
  notes: 'Estándar europeo',
  is_active: true
};

describe('mapProtector', () => {
  it('mapea todos los campos correctamente', () => {
    const result = mapProtector(baseDto);

    expect(result.id).toBe('prot-uuid-1');
    expect(result.name).toBe('Cajas tamaño BluRay');
    expect(result.category).toBe('box');
    expect(result.notes).toBe('Estándar europeo');
    expect(result.isActive).toBe(true);
  });

  it('mapea los packs con url correctamente', () => {
    const result = mapProtector(baseDto);

    expect(result.packs).toHaveLength(2);
    expect(result.packs[0]).toEqual({ quantity: 10, price: 8.99, url: 'https://example.com/pack10' });
    expect(result.packs[1]).toEqual({ quantity: 50, price: 34.99, url: null });
  });

  it('reemplaza packs undefined por array vacío', () => {
    const dto = { ...baseDto, packs: undefined as unknown as ProtectorDto['packs'] };
    expect(mapProtector(dto).packs).toEqual([]);
  });

  it('mapea notes null a null', () => {
    expect(mapProtector({ ...baseDto, notes: null }).notes).toBeNull();
  });

  it('mapea is_active false correctamente', () => {
    expect(mapProtector({ ...baseDto, is_active: false }).isActive).toBe(false);
  });
});

describe('mapProtectorToInsertDto', () => {
  const model: Omit<ProtectorModel, 'id'> = {
    name: 'Cajas Switch',
    packs: [{ quantity: 25, price: 19.99, url: null }],
    category: 'box',
    notes: null,
    isActive: true
  };

  it('mapea el modelo al DTO de inserción correctamente', () => {
    const result = mapProtectorToInsertDto(model);

    expect(result.name).toBe('Cajas Switch');
    expect(result.packs).toEqual([{ quantity: 25, price: 19.99, url: null }]);
    expect(result.category).toBe('box');
    expect(result.notes).toBeNull();
    expect(result.is_active).toBe(true);
  });

  it('no incluye el campo id en el DTO', () => {
    expect(mapProtectorToInsertDto(model)).not.toHaveProperty('id');
  });
});
