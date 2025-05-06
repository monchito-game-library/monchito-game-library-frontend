export function applySavedTheme() {
  const themeKey = 'user-theme';
  const saved = localStorage.getItem(themeKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const html = document.documentElement;
  const useDark = saved === 'dark' || (!saved && prefersDark);

  if (useDark) {
    html.classList.add('dark-mode');
  } else {
    html.classList.remove('dark-mode');
  }
}
