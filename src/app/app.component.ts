import {
  Component,
  Inject,
  Optional,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Request } from 'express';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { DOCUMENT, isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'universalpruebas';
  isServer: boolean;

  constructor(
    private renderer: Renderer2,
    private translateService: TranslateService,
    @Optional() @Inject(REQUEST) private request: Request,
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private transferState: TransferState
  ) {
    this.isServer = isPlatformServer(platformId);
    this.translateService.langs = ['en', 'es'];
    if (this.isServer) this.recoverServerLang();
    else this.recoverBrowserLang();
    this.translateService.onLangChange.subscribe(({lang}) => {
      this.changeCurrentLang(lang, true);
    });
  }

  changeCurrentLang(lang: string, saveCookie = false) {
    this.translateService.use(lang);
    if(this.document) { // check if document exist, it's a ssr prerender stuff
      this.renderer.setAttribute(this.document.querySelector('html'), 'lang', lang);
      if (saveCookie && !this.isServer) {
        this.document.cookie = `lang=${lang}; path=/; `;
      }
    }
  }

  /**
   * settea el lenguage por el siguiente orden de prioridad:
   * - lenguaje almacenado en cookies |
   * - lenguaje por defecto aceptado por el navegador en la request |
   * - default locale -> ingles
   */
  private recoverServerLang(): void {
    this.changeCurrentLang(
      this.isValidLang(this.request?.cookies?.lang) ||
        this.isValidLang(
          this.request?.headers['accept-language']?.substring(0, 2)
        ) ||
        'en'
    );
    this.transferState.set(
      makeStateKey<string>('lang'),
      this.translateService.currentLang
    );
  }

  /**
   * - lenguaje almacenado en el transferState (el usado en el server) (EN CASO DE SSR, SIEMPRE VA A SALIR ESTE, EL RESTO ES POR PREVENIR O NO SSR) |
   * - lenguaje almacenado en cookies |
   * - defecto setteado al importar el TranslateModule.forRoot |
   * - lenguaje del navegador |
   * - default locale -> ingles
   */
  private recoverBrowserLang(): void {
    this.changeCurrentLang(
      this.isValidLang(
        this.transferState.get(makeStateKey<string>('lang'), undefined)
      ) ||
        this.isValidLang(this.getCookieLang()) ||
        this.isValidLang(this.translateService.getDefaultLang()) ||
        this.isValidLang(this.translateService.getBrowserLang()) ||
        'en'
    );
  }

  private getCookieLang(): string | undefined {
    const parts = `; ${this.document.cookie}`.split('; lang=');
    return parts.length != 2 ? undefined : parts?.pop()?.split(';').shift();
  }

  private isValidLang(lang: string | undefined): string | undefined {
    return lang && this.translateService.langs.find((l) => l === lang);
  }
}
