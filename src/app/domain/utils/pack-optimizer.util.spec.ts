import { describe, expect, it } from 'vitest';

import { optimizePacks, PackSuggestion } from './pack-optimizer.util';
import { OrderProductPackModel } from '@/models/order/order-product.model';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pack(quantity: number, price: number, url = 'https://example.com'): OrderProductPackModel {
  return { url, price, quantity };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('optimizePacks', () => {
  describe('casos de borde — entradas inválidas', () => {
    it('devuelve [] cuando needed es 0', () => {
      expect(optimizePacks(0, [pack(10, 5)])).toEqual([]);
    });

    it('devuelve [] cuando needed es negativo', () => {
      expect(optimizePacks(-5, [pack(10, 5)])).toEqual([]);
    });

    it('devuelve [] cuando packs está vacío', () => {
      expect(optimizePacks(10, [])).toEqual([]);
    });
  });

  describe('pack único — cobertura exacta', () => {
    it('devuelve una sugerencia con totalUnits === needed cuando el pack encaja exactamente', () => {
      const suggestions = optimizePacks(10, [pack(10, 5)]);

      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      const first = suggestions[0];
      expect(first.totalUnits).toBe(10);
      expect(first.breakdown[0].pack.quantity).toBe(10);
      expect(first.breakdown[0].count).toBe(1);
    });

    it('calcula el totalCost correctamente para pack único exacto', () => {
      const suggestions = optimizePacks(10, [pack(10, 5)]);

      expect(suggestions[0].totalCost).toBe(5);
    });
  });

  describe('múltiples packs — combinación más barata', () => {
    it('encuentra la combinación exacta más barata (2 × pack10 vs 1 × pack25)', () => {
      // needed=20: exacta → 2×pack10=6€; pack25=6€ → ambas cuestan 6, pero 2×pack10 cubre exactamente 20
      const p10 = pack(10, 3);
      const p25 = pack(25, 6);
      const suggestions = optimizePacks(20, [p10, p25]);

      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      // La primera sugerencia debe cubrir exactamente 20 unidades con coste 6
      const exact = suggestions[0];
      expect(exact.totalUnits).toBe(20);
      expect(exact.totalCost).toBe(6);
    });

    it('incluye la opción de overshoot cuando es la única con packs significativos', () => {
      // needed=3, solo hay pack10: debe sugerir 1×pack10 (10 unidades)
      const suggestions = optimizePacks(3, [pack(10, 5)]);

      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].totalUnits).toBe(10);
    });
  });

  describe('solo pack de unidad 1 — redondeo a múltiplos de 5', () => {
    it('la primera sugerencia es la exacta del DP y las siguientes son redondeadas a múltiplos de 5', () => {
      const suggestions = optimizePacks(7, [pack(1, 1)]);

      // exact = 7 (del DP con pack-1); rounded = 10, 15, 20 — se toman hasta 3
      // [7, 10, 15] tras deduplicar y limitar a 3
      expect(suggestions.length).toBe(3);
      expect(suggestions[0].totalUnits).toBe(7);
      expect(suggestions[1].totalUnits).toBe(10);
      expect(suggestions[2].totalUnits).toBe(15);
    });

    it('cuando needed es múltiplo de 5 la sugerencia exacta coincide con el primer redondeado y se deduplica', () => {
      const suggestions = optimizePacks(10, [pack(1, 2)]);

      // exact = 10; rounded = [10, 15, 20] → 10 se deduplica → [10, 15, 20]
      expect(suggestions[0].totalUnits).toBe(10);
      expect(suggestions[1].totalUnits).toBe(15);
      expect(suggestions[2].totalUnits).toBe(20);
    });

    it('el breakdown contiene el count correcto igual a totalUnits para pack-1', () => {
      const p1 = pack(1, 1);
      // needed=3 → exact del DP = 3 unidades
      const suggestions = optimizePacks(3, [p1]);

      expect(suggestions[0].totalUnits).toBe(3);
      expect(suggestions[0].breakdown[0].count).toBe(3);
    });
  });

  describe('deduplicación', () => {
    it('no devuelve la misma combinación dos veces', () => {
      // Con pack único la opción exacta y la redondeada pueden coincidir
      const suggestions = optimizePacks(10, [pack(10, 5)]);
      const keys = suggestions.map((s) => s.breakdown.map((b) => `${b.pack.quantity}x${b.count}`).join('|'));
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('con múltiples packs que producen la misma combinación, solo aparece una vez', () => {
      // needed=20, p10=3€: 2×pack10 cubre exacto → aparece una sola vez
      const suggestions = optimizePacks(20, [pack(10, 3), pack(25, 9)]);
      const keys = suggestions.map((s) => s.breakdown.map((b) => `${b.pack.quantity}x${b.count}`).join('|'));
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('límite de 3 sugerencias', () => {
    it('devuelve como máximo 3 sugerencias', () => {
      const packs = [pack(1, 1), pack(3, 2.5), pack(5, 3.5), pack(10, 6)];
      const suggestions = optimizePacks(7, packs);

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('orden del breakdown — descendente por tamaño de pack', () => {
    it('el breakdown está ordenado de mayor a menor quantity', () => {
      // needed=12: puede usarse pack10 + pack1×2 o pack5×2 + pack1×2, etc.
      const suggestions = optimizePacks(12, [pack(1, 1), pack(5, 4), pack(10, 7)]);

      for (const suggestion of suggestions) {
        const quantities = suggestion.breakdown.map((b) => b.pack.quantity);
        for (let i = 1; i < quantities.length; i++) {
          expect(quantities[i]).toBeLessThanOrEqual(quantities[i - 1]);
        }
      }
    });
  });

  describe('totalCost y unitPrice redondeados', () => {
    it('totalCost está redondeado a 2 decimales', () => {
      const suggestions = optimizePacks(3, [pack(1, 1.005)]);

      for (const s of suggestions) {
        const rounded = Math.round(s.totalCost * 100) / 100;
        expect(s.totalCost).toBe(rounded);
      }
    });

    it('unitPrice está redondeado a 4 decimales', () => {
      const suggestions = optimizePacks(7, [pack(3, 2.333)]);

      for (const s of suggestions) {
        const rounded = Math.round(s.unitPrice * 10000) / 10000;
        expect(s.unitPrice).toBe(rounded);
      }
    });

    it('unitPrice es totalCost / totalUnits redondeado a 4 decimales', () => {
      const suggestions = optimizePacks(10, [pack(10, 3.75)]);
      const s = suggestions[0];

      const expected = Math.round((s.totalCost / s.totalUnits) * 10000) / 10000;
      expect(s.unitPrice).toBe(expected);
    });
  });

  describe('valores del breakdown — counts correctos', () => {
    it('el count refleja cuántos packs de ese tamaño se usan', () => {
      // needed=30 con pack10=3€: solución óptima → 3×pack10
      const p10 = pack(10, 3);
      const suggestions = optimizePacks(30, [p10]);

      // Al ser pack-1 ausente se hacen sugerencias redondeadas: base=ceil(30/5)*5=30 → 3×pack10? No,
      // pack(10,3) tiene quantity>1, así que se usa DP.
      const s = suggestions[0];
      const entry = s.breakdown.find((b) => b.pack.quantity === 10);
      expect(entry).toBeDefined();
      expect(entry!.count).toBe(3);
    });

    it('combinación de packs distintos tiene counts correctos', () => {
      // needed=11 con pack10=4€ y pack1=0.5€ → pack10×1 + pack1×1 = cost 4.5
      const p1 = pack(1, 0.5);
      const p10 = pack(10, 4);
      const suggestions = optimizePacks(11, [p1, p10]);

      const exact = suggestions[0];
      expect(exact.totalUnits).toBe(11);

      const entry10 = exact.breakdown.find((b) => b.pack.quantity === 10);
      const entry1 = exact.breakdown.find((b) => b.pack.quantity === 1);
      expect(entry10?.count).toBe(1);
      expect(entry1?.count).toBe(1);
    });
  });

  describe('precio por unidad — el optimizador elige el más barato', () => {
    it('elige el pack con menor precio por unidad cuando hay opciones', () => {
      // pack5=10€ (2€/u) vs pack10=15€ (1.5€/u) para needed=10
      const p5 = pack(5, 10);
      const p10 = pack(10, 15);
      const suggestions = optimizePacks(10, [p5, p10]);

      // La primera sugerencia debe ser 1×pack10 (15€) vs 2×pack5 (20€)
      expect(suggestions[0].totalCost).toBe(15);
    });
  });
});
