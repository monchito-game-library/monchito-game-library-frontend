import * as Sentry from '@sentry/angular';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from '@/env';

if (environment.sentry.enabled) {
  Sentry.init({
    dsn: environment.sentry.dsn,
    release: environment.sentry.release,
    environment: 'production',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
