import { ProtectorPack } from '@/models/protector/protector.model';
import { ProtectorCategory } from '@/types/protector-category.type';

/** Shape emitted by the protector edit panel on save. */
export interface ProtectorFormResult {
  name: string;
  packs: ProtectorPack[];
  category: ProtectorCategory;
  notes: string | null;
}
