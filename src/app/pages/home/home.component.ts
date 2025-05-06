import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ThemeService } from '../../services/theme.service';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { availableLangConstant } from '../../models/constants/available-lang.constant';
import { AvailableLangInterface } from '../../models/interfaces/available-lang.interface';

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
    MatFormField,
    MatLabel,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    MatIconButton,
    MatTooltip,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private _themeService: ThemeService = inject(ThemeService);
  private _translocoService: TranslocoService = inject(TranslocoService);

  isDark: boolean = false;
  availableLanguages: AvailableLangInterface[] = availableLangConstant
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
    this.isDark
      ? this._themeService.setDarkTheme()
      : this._themeService.setLightTheme();
  }
}
