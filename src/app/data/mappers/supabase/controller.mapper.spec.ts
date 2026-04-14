import { describe, expect, it } from 'vitest';

import { ControllerDto } from '@/dtos/supabase/controller.dto';
import { ControllerModel } from '@/models/controller/controller.model';
import { mapController, mapControllerToInsertDto } from '@/mappers/supabase/controller.mapper';

const baseDto: ControllerDto = {
  id: 'controller-uuid-1',
  user_id: 'user-uuid-1',
  brand_id: 'brand-uuid-1',
  model_id: 'model-uuid-1',
  edition_id: 'edition-uuid-1',
  color: 'Negro',
  compatibility: 'PS5',
  condition: 'new',
  price: 79.99,
  store: 'store-uuid-1',
  purchase_date: '2023-12-25',
  notes: 'Edición limitada',
  created_at: '2023-12-25T09:00:00Z'
};

const baseModel: ControllerModel = {
  id: 'controller-uuid-1',
  userId: 'user-uuid-1',
  brandId: 'brand-uuid-1',
  modelId: 'model-uuid-1',
  editionId: 'edition-uuid-1',
  color: 'Negro',
  compatibility: 'PS5',
  condition: 'new',
  price: 79.99,
  store: 'store-uuid-1',
  purchaseDate: '2023-12-25',
  notes: 'Edición limitada',
  createdAt: '2023-12-25T09:00:00Z'
};

describe('mapController', () => {
  it('mapea todos los campos correctamente', () => {
    const result = mapController(baseDto);

    expect(result.id).toBe('controller-uuid-1');
    expect(result.userId).toBe('user-uuid-1');
    expect(result.brandId).toBe('brand-uuid-1');
    expect(result.modelId).toBe('model-uuid-1');
    expect(result.editionId).toBe('edition-uuid-1');
    expect(result.color).toBe('Negro');
    expect(result.compatibility).toBe('PS5');
    expect(result.condition).toBe('new');
    expect(result.price).toBe(79.99);
    expect(result.store).toBe('store-uuid-1');
    expect(result.purchaseDate).toBe('2023-12-25');
    expect(result.notes).toBe('Edición limitada');
    expect(result.createdAt).toBe('2023-12-25T09:00:00Z');
  });

  it('mapea editionId null a null', () => {
    expect(mapController({ ...baseDto, edition_id: null }).editionId).toBeNull();
  });

  it('mapea price null a null', () => {
    expect(mapController({ ...baseDto, price: null }).price).toBeNull();
  });

  it('mapea store null a null', () => {
    expect(mapController({ ...baseDto, store: null }).store).toBeNull();
  });

  it('mapea purchase_date null a null', () => {
    expect(mapController({ ...baseDto, purchase_date: null }).purchaseDate).toBeNull();
  });

  it('mapea notes null a null', () => {
    expect(mapController({ ...baseDto, notes: null }).notes).toBeNull();
  });

  it('mapea condición used correctamente', () => {
    expect(mapController({ ...baseDto, condition: 'used' }).condition).toBe('used');
  });

  it('mapea compatibilidad Xbox correctamente', () => {
    expect(mapController({ ...baseDto, compatibility: 'Xbox' }).compatibility).toBe('Xbox');
  });

  it('mapea compatibilidad Universal correctamente', () => {
    expect(mapController({ ...baseDto, compatibility: 'Universal' }).compatibility).toBe('Universal');
  });
});

describe('mapControllerToInsertDto', () => {
  it('mapea todos los campos al DTO de inserción', () => {
    const result = mapControllerToInsertDto('user-1', baseModel);

    expect(result.user_id).toBe('user-1');
    expect(result.brand_id).toBe('brand-uuid-1');
    expect(result.model_id).toBe('model-uuid-1');
    expect(result.edition_id).toBe('edition-uuid-1');
    expect(result.color).toBe('Negro');
    expect(result.compatibility).toBe('PS5');
    expect(result.condition).toBe('new');
    expect(result.price).toBe(79.99);
    expect(result.store).toBe('store-uuid-1');
    expect(result.purchase_date).toBe('2023-12-25');
    expect(result.notes).toBe('Edición limitada');
  });

  it('propaga editionId null al DTO', () => {
    expect(mapControllerToInsertDto('user-1', { ...baseModel, editionId: null }).edition_id).toBeNull();
  });

  it('propaga price null al DTO', () => {
    expect(mapControllerToInsertDto('user-1', { ...baseModel, price: null }).price).toBeNull();
  });

  it('propaga store null al DTO', () => {
    expect(mapControllerToInsertDto('user-1', { ...baseModel, store: null }).store).toBeNull();
  });

  it('propaga purchaseDate null al DTO', () => {
    expect(mapControllerToInsertDto('user-1', { ...baseModel, purchaseDate: null }).purchase_date).toBeNull();
  });

  it('propaga notes null al DTO', () => {
    expect(mapControllerToInsertDto('user-1', { ...baseModel, notes: null }).notes).toBeNull();
  });
});
