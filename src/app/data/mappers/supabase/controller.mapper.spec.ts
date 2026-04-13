import { describe, expect, it } from 'vitest';

import { ControllerDto } from '@/dtos/supabase/controller.dto';
import { ControllerModel } from '@/models/controller/controller.model';
import { mapController, mapControllerToInsertDto } from '@/mappers/supabase/controller.mapper';

const baseDto: ControllerDto = {
  id: 'controller-uuid-1',
  user_id: 'user-uuid-1',
  model: 'DualSense',
  edition: 'Edición God of War',
  color: 'Negro',
  compatibility: 'PS5',
  condition: 'new',
  price: 79.99,
  store: 'GAME',
  purchase_date: '2023-12-25',
  notes: 'Edición limitada',
  created_at: '2023-12-25T09:00:00Z'
};

const baseModel: ControllerModel = {
  id: 'controller-uuid-1',
  userId: 'user-uuid-1',
  model: 'DualSense',
  edition: 'Edición God of War',
  color: 'Negro',
  compatibility: 'PS5',
  condition: 'new',
  price: 79.99,
  store: 'GAME',
  purchaseDate: '2023-12-25',
  notes: 'Edición limitada',
  createdAt: '2023-12-25T09:00:00Z'
};

describe('mapController', () => {
  it('mapea todos los campos correctamente', () => {
    const result = mapController(baseDto);

    expect(result.id).toBe('controller-uuid-1');
    expect(result.userId).toBe('user-uuid-1');
    expect(result.model).toBe('DualSense');
    expect(result.edition).toBe('Edición God of War');
    expect(result.color).toBe('Negro');
    expect(result.compatibility).toBe('PS5');
    expect(result.condition).toBe('new');
    expect(result.price).toBe(79.99);
    expect(result.store).toBe('GAME');
    expect(result.purchaseDate).toBe('2023-12-25');
    expect(result.notes).toBe('Edición limitada');
    expect(result.createdAt).toBe('2023-12-25T09:00:00Z');
  });

  it('mapea edition null a null', () => {
    const result = mapController({ ...baseDto, edition: null });
    expect(result.edition).toBeNull();
  });

  it('mapea price null a null', () => {
    const result = mapController({ ...baseDto, price: null });
    expect(result.price).toBeNull();
  });

  it('mapea store null a null', () => {
    const result = mapController({ ...baseDto, store: null });
    expect(result.store).toBeNull();
  });

  it('mapea purchase_date null a null', () => {
    const result = mapController({ ...baseDto, purchase_date: null });
    expect(result.purchaseDate).toBeNull();
  });

  it('mapea notes null a null', () => {
    const result = mapController({ ...baseDto, notes: null });
    expect(result.notes).toBeNull();
  });

  it('mapea condición used correctamente', () => {
    const result = mapController({ ...baseDto, condition: 'used' });
    expect(result.condition).toBe('used');
  });

  it('mapea compatibilidad Xbox correctamente', () => {
    const result = mapController({ ...baseDto, compatibility: 'Xbox' });
    expect(result.compatibility).toBe('Xbox');
  });

  it('mapea compatibilidad Universal correctamente', () => {
    const result = mapController({ ...baseDto, compatibility: 'Universal' });
    expect(result.compatibility).toBe('Universal');
  });
});

describe('mapControllerToInsertDto', () => {
  it('mapea todos los campos al DTO de inserción', () => {
    const result = mapControllerToInsertDto('user-1', baseModel);

    expect(result.user_id).toBe('user-1');
    expect(result.model).toBe('DualSense');
    expect(result.edition).toBe('Edición God of War');
    expect(result.color).toBe('Negro');
    expect(result.compatibility).toBe('PS5');
    expect(result.condition).toBe('new');
    expect(result.price).toBe(79.99);
    expect(result.store).toBe('GAME');
    expect(result.purchase_date).toBe('2023-12-25');
    expect(result.notes).toBe('Edición limitada');
  });

  it('propaga edition null al DTO', () => {
    const result = mapControllerToInsertDto('user-1', { ...baseModel, edition: null });
    expect(result.edition).toBeNull();
  });

  it('propaga price null al DTO', () => {
    const result = mapControllerToInsertDto('user-1', { ...baseModel, price: null });
    expect(result.price).toBeNull();
  });

  it('propaga store null al DTO', () => {
    const result = mapControllerToInsertDto('user-1', { ...baseModel, store: null });
    expect(result.store).toBeNull();
  });

  it('propaga purchaseDate null al DTO', () => {
    const result = mapControllerToInsertDto('user-1', { ...baseModel, purchaseDate: null });
    expect(result.purchase_date).toBeNull();
  });

  it('propaga notes null al DTO', () => {
    const result = mapControllerToInsertDto('user-1', { ...baseModel, notes: null });
    expect(result.notes).toBeNull();
  });
});
