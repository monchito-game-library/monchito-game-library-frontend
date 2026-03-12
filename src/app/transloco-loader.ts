import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** HTTP-backed Transloco loader. Fetches translation JSON files from the assets folder. */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly _http: HttpClient = inject(HttpClient);

  /**
   * Fetches the translation file for the given language code.
   * The file is expected at `assets/i18n/{lang}.json`.
   *
   * @param {string} lang - Language code (e.g. 'es', 'en')
   */
  getTranslation(lang: string): Observable<Translation> {
    return this._http.get<Translation>(`assets/i18n/${lang}.json`);
  }
}
