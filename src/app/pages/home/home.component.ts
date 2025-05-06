import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardContent, RouterLink, MatIcon, MatSlideToggle],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isDark: boolean = false;

  private themeService: ThemeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.initTheme();
    this.isDark = this.themeService.isDarkTheme();
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.isDark
      ? this.themeService.setDarkTheme()
      : this.themeService.setLightTheme();
  }
}
