import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ThemeService } from '../../services/theme.service';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { availableLangConstant } from '../../models/constants/available-lang.constant';
import { AvailableLangInterface } from '../../models/interfaces/available-lang.interface';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    RouterLink,
    MatIcon,
    TranslocoPipe,
    ReactiveFormsModule,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatDivider
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private _themeService: ThemeService = inject(ThemeService);
  private _translocoService: TranslocoService = inject(TranslocoService);

  isDark: boolean = false;
  availableLanguages: AvailableLangInterface[] = availableLangConstant;
  selectedLangControl: FormControl<string | null> = new FormControl(this._translocoService.getActiveLang());

  ngOnInit(): void {
    this._themeService.initTheme();
    this.isDark = this._themeService.isDarkTheme();

    this.selectedLangControl.valueChanges.subscribe((lang: string | null) => {
      if (lang) {
        this._translocoService.setActiveLang(lang);
      }
    });
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.isDark ? this._themeService.setDarkTheme() : this._themeService.setLightTheme();
  }
}
