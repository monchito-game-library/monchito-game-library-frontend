import { AvailableStoresInterface } from '../interfaces/available-stores.interface';

/**
 * Lista de tiendas disponibles para un videojuego.
 * La propiedad `labelKey` se utiliza con Transloco.
 */
export const availableStoresConstant: AvailableStoresInterface[] = [
  { code: 'gm-ibe', labelKey: 'stores.game' },
  { code: 'amz', labelKey: 'stores.amz' },
  { code: 'ebay', labelKey: 'stores.ebay' },
  { code: 'mrv', labelKey: 'stores.mrv' },
  { code: 'psn', labelKey: 'stores.psn' },
  { code: 'ms', labelKey: 'stores.ms' },
  { code: 'ns-store', labelKey: 'stores.ns-store' },
  { code: 'pla', labelKey: 'stores.pla' },
  { code: 'xtr', labelKey: 'stores.xtr' },
  { code: 'mdk', labelKey: 'stores.mdk' },
  { code: 'lmt', labelKey: 'stores.lmt' },
  { code: 'lrn', labelKey: 'stores.lrn' },
  { code: 'wall', labelKey: 'stores.wall' },
  { code: 'cex', labelKey: 'stores.cex' },
  { code: 'cnd-ga', labelKey: 'stores.cnd-ga' },
  { code: 'nis', labelKey: 'stores.nis' },
  { code: 'imp-ga', labelKey: 'stores.imp-ga' },
  { code: 'akb-ga', labelKey: 'stores.akb-ga' },
  { code: 'td-cons', labelKey: 'stores.td-cons' }
];
