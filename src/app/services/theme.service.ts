import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private readonly themeKey = 'user-theme';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initTheme(): void {
    const saved = localStorage.getItem(this.themeKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved === 'dark' || (!saved && prefersDark)) {
      this.setDarkTheme();
    } else {
      this.setLightTheme();
    }
  }

  setDarkTheme(): void {
    this.renderer.addClass(document.documentElement, 'dark-mode');
    localStorage.setItem(this.themeKey, 'dark');
  }

  setLightTheme(): void {
    this.renderer.removeClass(document.documentElement, 'dark-mode');
    localStorage.setItem(this.themeKey, 'light');
  }

  isDarkTheme(): boolean {
    return document.documentElement.classList.contains('dark-mode');
  }
}
