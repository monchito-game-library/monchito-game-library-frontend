import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WishlistCardComponent } from './wishlist-card.component';

const baseItem: WishlistItemModel = {
  id: 'w-1',
  userId: 'u-1',
  gameCatalogId: 'cat-1',
  title: 'God of War',
  slug: 'god-of-war',
  platform: 'PS5',
  desiredPrice: 39.99,
  priority: 4,
  notes: null,
  createdAt: '2024-01-01',
  imageUrl: null,
  rawgId: 58175,
  releasedDate: '2018-04-20',
  rating: 4.42,
  platforms: ['PS4', 'PS5'],
  genres: ['Action']
};

describe('WishlistCardComponent', () => {
  let component: WishlistCardComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<WishlistCardComponent>>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        WishlistCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(WishlistCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', baseItem);
  });

  describe('storeLinks (computed)', () => {
    it('genera 4 enlaces de tienda', () => {
      expect(component.storeLinks()).toHaveLength(4);
    });

    it('incluye la plataforma en el término de búsqueda cuando está definida', () => {
      const links = component.storeLinks();
      const searchTerm = `God of War PS5`;

      expect(links[0].url).toContain(searchTerm.replace(/ /g, '+'));
    });

    it('usa solo el título cuando la plataforma está vacía', () => {
      TestBed.createComponent(WishlistCardComponent);
      const fixture2 = TestBed.createComponent(WishlistCardComponent);
      fixture2.componentRef.setInput('item', { ...baseItem, platform: '' });
      const comp2 = fixture2.componentInstance;

      const links = comp2.storeLinks();
      const ceXLink = links.find((l) => l.label === 'CEX')!;

      expect(ceXLink.url).toContain('God+of+War');
      expect(ceXLink.url).not.toContain('PS5');
    });

    it('genera la URL de Amazon correctamente', () => {
      const amazon = component.storeLinks().find((l) => l.label === 'Amazon')!;

      expect(amazon.url).toContain('amazon.es');
      expect(amazon.url).toContain('God+of+War+PS5');
    });

    it('genera la URL de GAME con el título codificado', () => {
      const game = component.storeLinks().find((l) => l.label === 'GAME')!;

      expect(game.url).toContain('game.es');
      expect(game.url).toContain(encodeURIComponent('God of War'));
    });

    it('genera la URL de Xtralife con el término completo codificado', () => {
      const xtralife = component.storeLinks().find((l) => l.label === 'Xtralife')!;

      expect(xtralife.url).toContain('xtralife.com');
      expect(xtralife.url).toContain(encodeURIComponent('God of War PS5'));
    });
  });

  describe('mobileMode y cardClicked', () => {
    it('onCardClick emite cardClicked cuando mobileMode es true', () => {
      fixture.componentRef.setInput('mobileMode', true);
      const emitted: WishlistItemModel[] = [];
      component.cardClicked.subscribe((v: WishlistItemModel) => emitted.push(v));

      component.onCardClick();

      expect(emitted).toHaveLength(1);
      expect(emitted[0].id).toBe('w-1');
    });

    it('onCardClick no emite cardClicked cuando mobileMode es false', () => {
      fixture.componentRef.setInput('mobileMode', false);
      const emitted: WishlistItemModel[] = [];
      component.cardClicked.subscribe((v: WishlistItemModel) => emitted.push(v));

      component.onCardClick();

      expect(emitted).toHaveLength(0);
    });
  });

  describe('outputs', () => {
    it('onEdit emite editClicked con el item', () => {
      const emitted: WishlistItemModel[] = [];
      component.editClicked.subscribe((v: WishlistItemModel) => emitted.push(v));

      component.onEdit();

      expect(emitted).toHaveLength(1);
      expect(emitted[0].id).toBe('w-1');
    });

    it('onDelete emite deleteClicked con el item', () => {
      const emitted: WishlistItemModel[] = [];
      component.deleteClicked.subscribe((v: WishlistItemModel) => emitted.push(v));

      component.onDelete();

      expect(emitted).toHaveLength(1);
      expect(emitted[0].id).toBe('w-1');
    });

    it('onOwn emite ownClicked con el item', () => {
      const emitted: WishlistItemModel[] = [];
      component.ownClicked.subscribe((v: WishlistItemModel) => emitted.push(v));

      component.onOwn();

      expect(emitted).toHaveLength(1);
      expect(emitted[0].id).toBe('w-1');
    });
  });
});
