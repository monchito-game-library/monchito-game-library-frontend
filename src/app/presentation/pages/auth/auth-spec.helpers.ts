import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

export const authTranslocoModule = TranslocoTestingModule.forRoot({
  langs: { en: {} },
  translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
});

export const authBaseImports = [ReactiveFormsModule, authTranslocoModule];

export const authBaseProviders = [{ provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }];

export const authBaseSchemas = [NO_ERRORS_SCHEMA];
