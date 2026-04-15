import { describe, expect, it } from 'vitest';

import { ConsoleDto } from '@/dtos/supabase/console.dto';
import { ConsoleModel } from '@/models/console/console.model';
import { mapConsole, mapConsoleToInsertDto } from '@/mappers/supabase/console.mapper';

const baseDto: ConsoleDto = {
  id: 'console-uuid-1',
  user_id: 'user-uuid-1',
  brand_id: 'brand-uuid-1',
  model_id: 'model-uuid-1',
  edition_id: null,
  region: 'PAL',
  condition: 'new',
  price: 549.99,
  store: 'store-uuid-1',
  purchase_date: '2023-11-10',
  notes: 'Edición estándar con lector de discos',
  created_at: '2023-11-10T10:00:00Z',
  for_sale: false,
  sale_price: null,
  sold_at: null,
  sold_price_final: null,
  active_loan_id: null,
  active_loan_to: null,
  active_loan_at: null
};

const baseModel: ConsoleModel = {
  id: 'console-uuid-1',
  userId: 'user-uuid-1',
  brandId: 'brand-uuid-1',
  modelId: 'model-uuid-1',
  editionId: null,
  region: 'PAL',
  condition: 'new',
  price: 549.99,
  store: 'store-uuid-1',
  purchaseDate: '2023-11-10',
  notes: 'Edición estándar con lector de discos',
  createdAt: '2023-11-10T10:00:00Z',
  forSale: false,
  salePrice: null,
  soldAt: null,
  soldPriceFinal: null,
  activeLoanId: null,
  activeLoanTo: null,
  activeLoanAt: null
};

describe('mapConsole', () => {
  it('mapea todos los campos correctamente', () => {
    const result = mapConsole(baseDto);

    expect(result.id).toBe('console-uuid-1');
    expect(result.userId).toBe('user-uuid-1');
    expect(result.brandId).toBe('brand-uuid-1');
    expect(result.modelId).toBe('model-uuid-1');
    expect(result.editionId).toBeNull();
    expect(result.region).toBe('PAL');
    expect(result.condition).toBe('new');
    expect(result.price).toBe(549.99);
    expect(result.store).toBe('store-uuid-1');
    expect(result.purchaseDate).toBe('2023-11-10');
    expect(result.notes).toBe('Edición estándar con lector de discos');
    expect(result.createdAt).toBe('2023-11-10T10:00:00Z');
  });

  it('mapea editionId con valor', () => {
    const result = mapConsole({ ...baseDto, edition_id: 'edition-uuid-1' });
    expect(result.editionId).toBe('edition-uuid-1');
  });

  it('mapea editionId null a null', () => {
    const result = mapConsole({ ...baseDto, edition_id: null });
    expect(result.editionId).toBeNull();
  });

  it('mapea region null a null', () => {
    expect(mapConsole({ ...baseDto, region: null }).region).toBeNull();
  });

  it('mapea price null a null', () => {
    expect(mapConsole({ ...baseDto, price: null }).price).toBeNull();
  });

  it('mapea store null a null', () => {
    expect(mapConsole({ ...baseDto, store: null }).store).toBeNull();
  });

  it('mapea purchase_date null a null', () => {
    expect(mapConsole({ ...baseDto, purchase_date: null }).purchaseDate).toBeNull();
  });

  it('mapea notes null a null', () => {
    expect(mapConsole({ ...baseDto, notes: null }).notes).toBeNull();
  });

  it('mapea condición used correctamente', () => {
    expect(mapConsole({ ...baseDto, condition: 'used' }).condition).toBe('used');
  });

  it('mapea región NTSC correctamente', () => {
    expect(mapConsole({ ...baseDto, region: 'NTSC' }).region).toBe('NTSC');
  });

  it('mapea región NTSC-J correctamente', () => {
    expect(mapConsole({ ...baseDto, region: 'NTSC-J' }).region).toBe('NTSC-J');
  });
});

describe('mapConsoleToInsertDto', () => {
  it('mapea todos los campos al DTO de inserción', () => {
    const result = mapConsoleToInsertDto('user-1', baseModel);

    expect(result.user_id).toBe('user-1');
    expect(result.brand_id).toBe('brand-uuid-1');
    expect(result.model_id).toBe('model-uuid-1');
    expect(result.edition_id).toBeNull();
    expect(result.region).toBe('PAL');
    expect(result.condition).toBe('new');
    expect(result.price).toBe(549.99);
    expect(result.store).toBe('store-uuid-1');
    expect(result.purchase_date).toBe('2023-11-10');
    expect(result.notes).toBe('Edición estándar con lector de discos');
  });

  it('propaga editionId al DTO', () => {
    const result = mapConsoleToInsertDto('user-1', { ...baseModel, editionId: 'edition-uuid-1' });
    expect(result.edition_id).toBe('edition-uuid-1');
  });

  it('propaga region null al DTO', () => {
    expect(mapConsoleToInsertDto('user-1', { ...baseModel, region: null }).region).toBeNull();
  });

  it('propaga price null al DTO', () => {
    expect(mapConsoleToInsertDto('user-1', { ...baseModel, price: null }).price).toBeNull();
  });

  it('propaga store null al DTO', () => {
    expect(mapConsoleToInsertDto('user-1', { ...baseModel, store: null }).store).toBeNull();
  });

  it('propaga purchaseDate null al DTO', () => {
    expect(mapConsoleToInsertDto('user-1', { ...baseModel, purchaseDate: null }).purchase_date).toBeNull();
  });

  it('propaga notes null al DTO', () => {
    expect(mapConsoleToInsertDto('user-1', { ...baseModel, notes: null }).notes).toBeNull();
  });
});
