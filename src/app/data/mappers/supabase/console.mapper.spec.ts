import { describe, expect, it } from 'vitest';

import { ConsoleDto } from '@/dtos/supabase/console.dto';
import { ConsoleModel } from '@/models/console/console.model';
import { mapConsole, mapConsoleToInsertDto } from '@/mappers/supabase/console.mapper';

const baseDto: ConsoleDto = {
  id: 'console-uuid-1',
  user_id: 'user-uuid-1',
  brand: 'Sony',
  model: 'PlayStation 5',
  region: 'PAL',
  condition: 'new',
  price: 549.99,
  store: 'MediaMarkt',
  purchase_date: '2023-11-10',
  notes: 'Edición estándar con lector de discos',
  created_at: '2023-11-10T10:00:00Z'
};

const baseModel: ConsoleModel = {
  id: 'console-uuid-1',
  userId: 'user-uuid-1',
  brand: 'Sony',
  model: 'PlayStation 5',
  region: 'PAL',
  condition: 'new',
  price: 549.99,
  store: 'MediaMarkt',
  purchaseDate: '2023-11-10',
  notes: 'Edición estándar con lector de discos',
  createdAt: '2023-11-10T10:00:00Z'
};

describe('mapConsole', () => {
  it('mapea todos los campos correctamente', () => {
    const result = mapConsole(baseDto);

    expect(result.id).toBe('console-uuid-1');
    expect(result.userId).toBe('user-uuid-1');
    expect(result.brand).toBe('Sony');
    expect(result.model).toBe('PlayStation 5');
    expect(result.region).toBe('PAL');
    expect(result.condition).toBe('new');
    expect(result.price).toBe(549.99);
    expect(result.store).toBe('MediaMarkt');
    expect(result.purchaseDate).toBe('2023-11-10');
    expect(result.notes).toBe('Edición estándar con lector de discos');
    expect(result.createdAt).toBe('2023-11-10T10:00:00Z');
  });

  it('mapea region null a null', () => {
    const result = mapConsole({ ...baseDto, region: null });
    expect(result.region).toBeNull();
  });

  it('mapea price null a null', () => {
    const result = mapConsole({ ...baseDto, price: null });
    expect(result.price).toBeNull();
  });

  it('mapea store null a null', () => {
    const result = mapConsole({ ...baseDto, store: null });
    expect(result.store).toBeNull();
  });

  it('mapea purchase_date null a null', () => {
    const result = mapConsole({ ...baseDto, purchase_date: null });
    expect(result.purchaseDate).toBeNull();
  });

  it('mapea notes null a null', () => {
    const result = mapConsole({ ...baseDto, notes: null });
    expect(result.notes).toBeNull();
  });

  it('mapea condición used correctamente', () => {
    const result = mapConsole({ ...baseDto, condition: 'used' });
    expect(result.condition).toBe('used');
  });

  it('mapea región NTSC correctamente', () => {
    const result = mapConsole({ ...baseDto, region: 'NTSC' });
    expect(result.region).toBe('NTSC');
  });

  it('mapea región NTSC-J correctamente', () => {
    const result = mapConsole({ ...baseDto, region: 'NTSC-J' });
    expect(result.region).toBe('NTSC-J');
  });
});

describe('mapConsoleToInsertDto', () => {
  it('mapea todos los campos al DTO de inserción', () => {
    const result = mapConsoleToInsertDto('user-1', baseModel);

    expect(result.user_id).toBe('user-1');
    expect(result.brand).toBe('Sony');
    expect(result.model).toBe('PlayStation 5');
    expect(result.region).toBe('PAL');
    expect(result.condition).toBe('new');
    expect(result.price).toBe(549.99);
    expect(result.store).toBe('MediaMarkt');
    expect(result.purchase_date).toBe('2023-11-10');
    expect(result.notes).toBe('Edición estándar con lector de discos');
  });

  it('propaga region null al DTO', () => {
    const result = mapConsoleToInsertDto('user-1', { ...baseModel, region: null });
    expect(result.region).toBeNull();
  });

  it('propaga price null al DTO', () => {
    const result = mapConsoleToInsertDto('user-1', { ...baseModel, price: null });
    expect(result.price).toBeNull();
  });

  it('propaga store null al DTO', () => {
    const result = mapConsoleToInsertDto('user-1', { ...baseModel, store: null });
    expect(result.store).toBeNull();
  });

  it('propaga purchaseDate null al DTO', () => {
    const result = mapConsoleToInsertDto('user-1', { ...baseModel, purchaseDate: null });
    expect(result.purchase_date).toBeNull();
  });

  it('propaga notes null al DTO', () => {
    const result = mapConsoleToInsertDto('user-1', { ...baseModel, notes: null });
    expect(result.notes).toBeNull();
  });
});
