import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { applySavedTheme } from './app/apply-saved.theme';

applySavedTheme();

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
