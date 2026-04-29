/**
 * Returns a localized relative time string from the given date to now.
 * Examples (locale='es'): "hace 2 días", "hace 3 meses", "hace un momento".
 *
 * Uses the native Intl.RelativeTimeFormat — no external dependencies.
 *
 * @param {string | Date} date - Date to compare against now
 * @param {'es' | 'en'} locale - Locale used to format the output
 */
export function formatRelativeTime(date: string | Date, locale: 'es' | 'en' = 'es'): string {
  const target = new Date(date).getTime();
  if (Number.isNaN(target)) return '';

  const diffMs = target - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absSec < 60) return formatter.format(Math.round(diffSec), 'second');
  if (absSec < 3600) return formatter.format(Math.round(diffSec / 60), 'minute');
  if (absSec < 86_400) return formatter.format(Math.round(diffSec / 3600), 'hour');
  if (absSec < 2_592_000) return formatter.format(Math.round(diffSec / 86_400), 'day');
  if (absSec < 31_536_000) return formatter.format(Math.round(diffSec / 2_592_000), 'month');
  return formatter.format(Math.round(diffSec / 31_536_000), 'year');
}
