/**
 * Converts a display name into a URL-safe kebab-case slug for terminal command paths.
 * Normalizes accents, lowercases, collapses non-alphanumeric characters to hyphens,
 * and trims leading/trailing hyphens.
 *
 * @param {string} name - Display name to slugify (e.g. "Game Boy", "Pokémon Mini")
 * @returns {string} Kebab-case slug (e.g. "game-boy", "pokemon-mini"), or "" if empty
 */
export function toCommandSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
